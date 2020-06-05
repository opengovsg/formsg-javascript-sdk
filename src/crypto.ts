import nacl from 'tweetnacl'

import {
  DecryptParams,
  DecryptedContent,
  EncryptedContent,
  EncryptedFileContent,
  FormField,
  Keypair,
  PackageInitParams,
} from './types'

import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from 'tweetnacl-util'

import { getPublicKey } from './util/publicKey'
import { determineIsFormFields } from './util/validate'

/**
 * Encrypt input with a unique keypair for each submission
 * @param encryptionPublicKey The base-64 encoded public key for encrypting.
 * @param msg The message to encrypt, will be stringified.
 * @param signingPrivateKey Optional. Must be a base-64 encoded private key,  will be used to signing the given msg param prior to encrypting.
 * @returns The encrypted basestring.
 */
function encrypt(
  msg: any,
  encryptionPublicKey: string,
  signingPrivateKey?: string
): EncryptedContent {
  let processedMsg = decodeUTF8(JSON.stringify(msg))

  if (signingPrivateKey) {
    processedMsg = nacl.sign(processedMsg, decodeBase64(signingPrivateKey))
  }

  return _encrypt(processedMsg, encryptionPublicKey)
}

/**
 * Helper function to encrypt input with a unique keypair for each submission.
 * @param msg The message to encrypt
 * @param theirPublicKey The base-64 encoded public key
 * @returns The encrypted basestring
 * @throws error if any of the encrypt methods fail
 */
function _encrypt(msg: Uint8Array, theirPublicKey: string): EncryptedContent {
  const submissionKeypair = generate()
  const nonce = nacl.randomBytes(24)
  const encrypted = encodeBase64(
    nacl.box(
      msg,
      nonce,
      decodeBase64(theirPublicKey),
      decodeBase64(submissionKeypair.secretKey)
    )
  )
  return `${submissionKeypair.publicKey};${encodeBase64(nonce)}:${encrypted}`
}

/**
 * Helper method to decrypt an encrypted submission.
 * @param formPrivateKey base64
 * @param encryptedContent encrypted string encoded in base64
 * @return The decrypted content, or null if decryption failed.
 */
function _decrypt(
  formPrivateKey: string,
  encryptedContent: EncryptedContent
): Uint8Array | null {
  try {
    const [submissionPublicKey, nonceEncrypted] = encryptedContent.split(';')
    const [nonce, encrypted] = nonceEncrypted.split(':').map(decodeBase64)
    return nacl.box.open(
      encrypted,
      nonce,
      decodeBase64(submissionPublicKey),
      decodeBase64(formPrivateKey)
    )
  } catch (err) {
    return null
  }
}

/**
 * Helper method to verify a signed message.
 * @param msg the message to verify
 * @param publicKey the public key to authenticate the signed message with
 * @returns the signed message if successful, else an error will be thrown.
 */
function _verifySignedMessage(
  msg: Uint8Array,
  publicKey: string
): Record<string, any> {
  const openedMessage = nacl.sign.open(msg, decodeBase64(publicKey))
  if (!openedMessage)
    throw new Error('Failed to open signed message with given public key')
  return JSON.parse(encodeUTF8(openedMessage))
}

/**
 * Higher order function returning a function to decrypt an encrypted
 * submission.
 * @param signingPublicKey The public key to open verified objects that was signed with the private key passed to this library.
 */
function decrypt(signingPublicKey: string) {
  /**
   * Decrypts an encrypted submission and returns it.
   * @param formSecretKey The base-64 secret key of the form to decrypt with.
   * @param decryptParams The params containing encrypted content and information.
   * @param decryptParams.encryptedContent The encrypted content encoded with base-64.
   * @param decryptParams.version The version of the payload. Used to determine the decryption process to decrypt the content with.
   * @param decryptParams.verifiedContent Optional. The encrypted and signed verified content. If given, the signingPublicKey will be used to attempt to open the signed message.
   * @returns The decrypted content if successful. Else, null will be returned.
   */
  function _internalDecrypt(
    formSecretKey: string,
    decryptParams: DecryptParams
  ): DecryptedContent | null {
    try {
      const { encryptedContent, verifiedContent, version } = decryptParams

      // Do not return the transformed object in `_decrypt` function as a signed
      // object is not encoded in UTF8 and is encoded in Base-64 instead.
      const decryptedContent = _decrypt(formSecretKey, encryptedContent)
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
        // Only care if it is the correct shape if verifiedContent exists, since
        // we need to append it to the end.
        // Decrypted message must be able to be authenticated by the public key.
        const decryptedVerifiedContent = _decrypt(
          formSecretKey,
          verifiedContent
        )
        if (!decryptedVerifiedContent) {
          // Returns null if verification for decrypt failed.
          throw new Error('Verification failed for signature')
        }
        const decryptedVerifiedObject = _verifySignedMessage(
          decryptedVerifiedContent,
          signingPublicKey
        )

        returnedObject.verified = decryptedVerifiedObject
      }

      return returnedObject
    } catch (err) {
      return null
    }
  }
  return _internalDecrypt
}

/**
 * Generates a new keypair for encryption.
 * @returns The generated keypair.
 */
function generate(): Keypair {
  const kp = nacl.box.keyPair()
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  }
}

function valid(signingPublicKey: string) {
  /**
   * Returns true if a pair of public & secret keys are associated with each other
   * @param publicKey The public key to verify against.
   * @param secretKey The private key to verify against.
   */
  function _internalValid(publicKey: string, secretKey: string) {
    const testResponse: FormField[] = []
    const internalValidationVersion = 1

    try {
      const cipherResponse = encrypt(testResponse, publicKey)
      // Use toString here since the return should be an empty array.
      return (
        testResponse.toString() ===
        decrypt(signingPublicKey)(secretKey, {
          encryptedContent: cipherResponse,
          version: internalValidationVersion,
        })?.responses.toString()
      )
    } catch (err) {
      return false
    }
  }
  return _internalValid
}

/**
 * Helper function to encrypt file with a unique keypair for each submission.
 * @param binary The file to encrypt, should be a blob that is converted to { @type Uint8Array} binary
 * @param formPublicKey The base-64 encoded public key
 * @returns Promise holding the encrypted file
 * @throws error if any of the encrypt methods fail
 */
async function encryptFile(
  binary: Uint8Array,
  formPublicKey: string
): Promise<EncryptedFileContent> {
  const submissionKeypair = generate()
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
 * Helper function to decrypt a file
 * @param formSecretKey Secret key as a base-64 string
 * @param encrypted Object returned from encryptFile function
 * @param encrypted.submissionPublicKey The submission public key as a base-64 string
 * @param encrypted.nonce The nonce as a base-64 string
 * @param encrypted.blob The encrypted file as a Blob object
 */
async function decryptFile(
  formSecretKey: string,
  { submissionPublicKey, nonce, binary: encryptedBinary }: EncryptedFileContent
): Promise<Uint8Array | null> {
  return nacl.box.open(
    encryptedBinary,
    decodeBase64(nonce),
    decodeBase64(submissionPublicKey),
    decodeBase64(formSecretKey)
  )
}

/**
 * Provider that accepts configuration before returning the crypto module to
 * init.
 */
export = function ({ mode, publicKey }: PackageInitParams) {
  const signingPublicKey = publicKey || getPublicKey(mode || 'production')
  return {
    encrypt,
    decrypt: decrypt(signingPublicKey),
    generate,
    valid: valid(signingPublicKey),
    encryptFile,
    decryptFile,
  }
}
