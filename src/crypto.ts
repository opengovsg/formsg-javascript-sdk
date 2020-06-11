import nacl from 'tweetnacl'

import {
  DecryptParams,
  DecryptedContent,
  EncryptedContent,
  EncryptedFileContent,
  FormField,
} from './types'

import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from 'tweetnacl-util'

import { determineIsFormFields } from './util/validate'
import { MissingPublicKeyError } from './errors'
import {
  encryptMessage,
  decryptContent,
  verifySignedMessage,
  generateKeypair,
} from './util/crypto'

export default class Crypto {
  publicSigningKey?: string

  constructor({ publicSigningKey }: { publicSigningKey?: string } = {}) {
    this.publicSigningKey = publicSigningKey
  }

  /**
   * Encrypt input with a unique keypair for each submission
   * @param encryptionPublicKey The base-64 encoded public key for encrypting.
   * @param msg The message to encrypt, will be stringified.
   * @param signingPrivateKey Optional. Must be a base-64 encoded private key. If given, will be used to signing the given msg param prior to encrypting.
   * @returns The encrypted basestring.
   */
  encrypt = (
    msg: any,
    encryptionPublicKey: string,
    signingPrivateKey?: string
  ): EncryptedContent => {
    let processedMsg = decodeUTF8(JSON.stringify(msg))

    if (signingPrivateKey) {
      processedMsg = nacl.sign(processedMsg, decodeBase64(signingPrivateKey))
    }

    return encryptMessage(processedMsg, encryptionPublicKey)
  }

  /**
   * Decrypts an encrypted submission and returns it.
   * @param formSecretKey The base-64 secret key of the form to decrypt with.
   * @param decryptParams The params containing encrypted content and information.
   * @param decryptParams.encryptedContent The encrypted content encoded with base-64.
   * @param decryptParams.version The version of the payload. Used to determine the decryption process to decrypt the content with.
   * @param decryptParams.verifiedContent Optional. The encrypted and signed verified content. If given, the signingPublicKey will be used to attempt to open the signed message.
   * @returns The decrypted content if successful. Else, null will be returned.
   * @throws {MissingPublicKeyError} if a public key is not provided when instantiating this class and is needed for verifying signed content.
   */
  decrypt = (
    formSecretKey: string,
    decryptParams: DecryptParams
  ): DecryptedContent | null => {
    try {
      const { encryptedContent, verifiedContent, version } = decryptParams

      // Do not return the transformed object in `_decrypt` function as a signed
      // object is not encoded in UTF8 and is encoded in Base-64 instead.
      const decryptedContent = decryptContent(formSecretKey, encryptedContent)
      if (!decryptedContent) {
        throw new Error('Failed to decrypt content')
      }
      const decryptedObject: Object = JSON.parse(encodeUTF8(decryptedContent))
      if (!determineIsFormFields(decryptedObject)) {
        throw new Error('Decrypted object does not fit expected shape')
      }

      let returnedObject: DecryptedContent = {
        responses: decryptedObject,
      }

      if (verifiedContent) {
        if (!this.publicSigningKey) {
          throw new MissingPublicKeyError(
            'Public signing key must be provided when instantiating the Crypto class in order to verify verified content'
          )
        }
        // Only care if it is the correct shape if verifiedContent exists, since
        // we need to append it to the end.
        // Decrypted message must be able to be authenticated by the public key.
        const decryptedVerifiedContent = decryptContent(
          formSecretKey,
          verifiedContent
        )
        if (!decryptedVerifiedContent) {
          // Returns null if decrypting verified content failed.
          throw new Error('Failed to decrypt verified content')
        }
        const decryptedVerifiedObject = verifySignedMessage(
          decryptedVerifiedContent,
          this.publicSigningKey
        )

        returnedObject.verified = decryptedVerifiedObject
      }

      return returnedObject
    } catch (err) {
      // Should only throw if MissingPublicKeyError.
      // This library should be able to be used to encrypt and decrypt content
      // if the content does not contain verified fields.
      if (err instanceof MissingPublicKeyError) {
        throw err
      }
      return null
    }
  }

  /**
   * Generates a new keypair for encryption.
   * @returns The generated keypair.
   */
  generate = generateKeypair

  /**
   * Returns true if a pair of public & secret keys are associated with each other
   * @param publicKey The public key to verify against.
   * @param secretKey The private key to verify against.
   */
  valid = (publicKey: string, secretKey: string) => {
    const testResponse: FormField[] = []
    const internalValidationVersion = 1

    const cipherResponse = this.encrypt(testResponse, publicKey)
    // Use toString here since the return should be an empty array.
    return (
      testResponse.toString() ===
      this.decrypt(secretKey, {
        encryptedContent: cipherResponse,
        version: internalValidationVersion,
      })?.responses.toString()
    )
  }

  /**
   * Encrypt given binary file with a unique keypair for each submission.
   * @param binary The file to encrypt, should be a blob that is converted to Uint8Array binary
   * @param formPublicKey The base-64 encoded public key
   * @returns Promise holding the encrypted file
   * @throws error if any of the encrypt methods fail
   */
  encryptFile = async (
    binary: Uint8Array,
    formPublicKey: string
  ): Promise<EncryptedFileContent> => {
    const submissionKeypair = this.generate()
    const nonce = nacl.randomBytes(24)
    return {
      submissionPublicKey: submissionKeypair.publicKey,
      nonce: encodeBase64(nonce),
      binary: nacl.box(
        binary,
        nonce,
        decodeBase64(formPublicKey),
        decodeBase64(submissionKeypair.secretKey)
      ),
    }
  }

  /**
   * Decrypt the given encrypted file content.
   * @param formSecretKey Secret key as a base-64 string
   * @param encrypted Object returned from encryptFile function
   * @param encrypted.submissionPublicKey The submission public key as a base-64 string
   * @param encrypted.nonce The nonce as a base-64 string
   * @param encrypted.blob The encrypted file as a Blob object
   */
  decryptFile = async (
    formSecretKey: string,
    {
      submissionPublicKey,
      nonce,
      binary: encryptedBinary,
    }: EncryptedFileContent
  ): Promise<Uint8Array | null> => {
    return nacl.box.open(
      encryptedBinary,
      decodeBase64(nonce),
      decodeBase64(submissionPublicKey),
      decodeBase64(formSecretKey)
    )
  }
}
