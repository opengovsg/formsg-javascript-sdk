import {
  decodeBase64,
  decodeUTF8,
  encodeBase64,
  encodeUTF8,
} from 'tweetnacl-util'

import { decryptContent, encryptMessage, generateKeypair } from './util/crypto'
import { determineIsFormFieldsV3 } from './util/validate'
import CryptoBase from './crypto-base'
import { MissingPublicKeyError } from './errors'
import {
  DecryptedContentV3,
  DecryptParams,
  DecryptParamsV3,
  EncryptedContentV3,
  FormFieldsV3,
} from './types'

export default class CryptoV3 extends CryptoBase {
  constructor() {
    super()
  }

  /**
   * Encrypt input with a unique keypair for each submission.
   * @param msg The message to encrypt, will be stringified.
   * @param form The base-64 encoded form public key for encrypting.
   * @returns The encrypted basestring.
   */
  encrypt = (msg: any, formPublicKey: string): EncryptedContentV3 => {
    const submissionKeypair = generateKeypair()

    const encryptedSubmissionSecretKey = encryptMessage(
      decodeBase64(submissionKeypair.secretKey),
      formPublicKey
    )

    const processedMsg = decodeUTF8(JSON.stringify(msg))
    const encryptedContent = encryptMessage(
      processedMsg,
      submissionKeypair.publicKey
    )

    return {
      encryptedContent,
      submissionSecretKey: submissionKeypair.secretKey,
      encryptedSubmissionSecretKey,
    }
  }

  /**
   * Decrypts an encrypted submission and returns it.
   * @param submissionSecretKey The base-64 encoded secret key for decrypting.
   * @param decryptParams The params containing encrypted content and information.
   * @param decryptParams.encryptedContent The encrypted content encoded with base-64.
   * @param decryptParams.version The version of the payload. Used to determine the decryption process to decrypt the content with.
   * @param decryptParams.verifiedContent Optional. The encrypted and signed verified content. If given, the signingPublicKey will be used to attempt to open the signed message.
   * @returns The decrypted content if successful. Else, null will be returned.
   * @throws {MissingPublicKeyError} if a public key is not provided when instantiating this class and is needed for verifying signed content.
   */
  decryptFromSubmissionKey = (
    submissionSecretKey: string,
    decryptParams: DecryptParams
  ): DecryptedContentV3 | null => {
    // try {
    const { encryptedContent, verifiedContent } = decryptParams

    // Do not return the transformed object in `_decrypt` function as a signed
    // object is not encoded in UTF8 and is encoded in Base-64 instead.
    const decryptedContent = decryptContent(
      submissionSecretKey,
      encryptedContent
    )
    if (!decryptedContent) {
      throw new Error('Failed to decrypt content')
    }
    const decryptedObject: Record<string, unknown> = JSON.parse(
      encodeUTF8(decryptedContent)
    )
    // if (!determineIsFormFieldsV3(decryptedObject)) {
    //   throw new Error('Decrypted object does not fit expected shape')
    // }

    const returnedObject: DecryptedContentV3 = {
      submissionSecretKey,
      responses: decryptedObject as FormFieldsV3,
    }

    /*
      if (verifiedContent) {
        if (!this.signingPublicKey) {
          throw new MissingPublicKeyError(
            'Public signing key must be provided when instantiating the Crypto class in order to verify verified content'
          )
        }
        // Only care if it is the correct shape if verifiedContent exists, since
        // we need to append it to the end.
        // Decrypted message must be able to be authenticated by the public key.
        const decryptedVerifiedContent = decryptContent(
          decryptionSecretKey,
          verifiedContent
        )
        if (!decryptedVerifiedContent) {
          // Returns null if decrypting verified content failed.
          throw new Error('Failed to decrypt verified content')
        }
        const decryptedVerifiedObject = verifySignedMessage(
          decryptedVerifiedContent,
          this.signingPublicKey
        )

        returnedObject.verified = decryptedVerifiedObject
      }
      */

    return returnedObject
    // } catch (err) {
    // Should only throw if MissingPublicKeyError.
    // This library should be able to be used to encrypt and decrypt content
    // if the content does not contain verified fields.
    //   if (err instanceof MissingPublicKeyError) {
    //     throw err
    //   }
    //   return null
    // }
  }

  /**
   * Decrypts an encrypted submission and returns it.
   * @param formSecretKey The base-64 encoded form secret key for decrypting the submission.
   * @param decryptParams The params containing encrypted content, encrypted submission key and information.
   * @param decryptParams.encryptedContent The encrypted content encoded with base-64.
   * @param decryptParams.encryptedSubmissionSecretKey The encrypted submission secret key encoded with base-64.
   * @param decryptParams.version The version of the payload. Used to determine the decryption process to decrypt the content with.
   * @param decryptParams.verifiedContent Optional. The encrypted and signed verified content. If given, the signingPublicKey will be used to attempt to open the signed message.
   * @returns The decrypted content if successful. Else, null will be returned.
   * @throws {MissingPublicKeyError} if a public key is not provided when instantiating this class and is needed for verifying signed content.
   */
  decrypt = (
    formSecretKey: string,
    decryptParams: DecryptParamsV3
  ): DecryptedContentV3 | null => {
    const { encryptedSubmissionSecretKey, ...rest } = decryptParams

    const submissionSecretKey = decryptContent(
      formSecretKey,
      encryptedSubmissionSecretKey
    )

    if (submissionSecretKey === null) return null

    return this.decryptFromSubmissionKey(
      encodeBase64(submissionSecretKey),
      rest
    )
  }

  /**
   * Returns true if a pair of public & secret keys are associated with each other
   * @param publicKey The public key to verify against.
   * @param secretKey The private key to verify against.
   */
  valid = (publicKey: string, secretKey: string) => {
    const testResponse: FormFieldsV3 = {}
    const internalValidationVersion = 3

    const cipherResponse = this.encrypt(testResponse, publicKey)
    // Use toString here since the return should be an empty array.
    return (
      testResponse.toString() ===
      this.decrypt(secretKey, {
        ...cipherResponse,
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
  /*
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
  */

  /**
   * Decrypt the given encrypted file content.
   * @param formSecretKey Secret key as a base-64 string
   * @param encrypted Object returned from encryptFile function
   * @param encrypted.submissionPublicKey The submission public key as a base-64 string
   * @param encrypted.nonce The nonce as a base-64 string
   * @param encrypted.blob The encrypted file as a Blob object
   */
  /*
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
  */

  /**
   * Decrypts an encrypted submission, and also download and decrypt any attachments alongside it.
   * @param formSecretKey Secret key as a base-64 string
   * @param decryptParams The params containing encrypted content and information.
   * @returns A promise of the decrypted submission, including attachments (if any). Or else returns null if a decryption error decrypting any part of the submission.
   * @throws {MissingPublicKeyError} if a public key is not provided when instantiating this class and is needed for verifying signed content.
   */
  /*
  decryptWithAttachments = async (
    formSecretKey: string,
    decryptParams: DecryptParams
  ): Promise<DecryptedContentAndAttachments | null> => {
    const decryptedRecords: DecryptedAttachments = {}
    const filenames: Record<string, string> = {}

    const attachmentRecords: EncryptedAttachmentRecords =
      decryptParams.attachmentDownloadUrls ?? {}
    const decryptedContent = this.decrypt(formSecretKey, decryptParams)
    if (decryptedContent === null) return null

    // Retrieve all original filenames for attachments for easy lookup
    decryptedContent.responses.forEach((response) => {
      if (response.fieldType === 'attachment' && response.answer) {
        filenames[response._id] = response.answer
      }
    })

    const fieldIds = Object.keys(attachmentRecords)
    // Check if all fieldIds are within filenames
    if (!areAttachmentFieldIdsValid(fieldIds, filenames)) {
      return null
    }

    const downloadPromises = fieldIds.map((fieldId) => {
      return (
        axios
          // Retrieve all the attachments as JSON
          .get<EncryptedAttachmentContent>(attachmentRecords[fieldId], {
            responseType: 'json',
          })
          // Decrypt all the attachments
          .then(({ data: downloadResponse }) => {
            const encryptedFile =
              convertEncryptedAttachmentToFileContent(downloadResponse)
            return this.decryptFile(formSecretKey, encryptedFile)
          })
          .then((decryptedFile) => {
            // Check if the file exists and set the filename accordingly; otherwise, throw an error
            if (decryptedFile) {
              decryptedRecords[fieldId] = {
                filename: filenames[fieldId],
                content: decryptedFile,
              }
            } else {
              throw new AttachmentDecryptionError()
            }
          })
      )
    })

    try {
      await Promise.all(downloadPromises)
    } catch {
      return null
    }

    return {
      content: decryptedContent,
      attachments: decryptedRecords,
    }
  }
  */
}
