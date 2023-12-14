import {
  decodeBase64,
  decodeUTF8,
  encodeBase64,
  encodeUTF8,
} from 'tweetnacl-util'

import { decryptContent, encryptMessage, generateKeypair } from './util/crypto'
import { determineIsFormFieldsV3 } from './util/validate'
import CryptoBase from './crypto-base'
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
      submissionPublicKey: submissionKeypair.publicKey,
      submissionSecretKey: submissionKeypair.secretKey,
      encryptedContent,
      encryptedSubmissionSecretKey,
    }
  }

  /**
   * Decrypts an encrypted submission and returns it.
   * @param submissionSecretKey The base-64 encoded secret key for decrypting.
   * @param decryptParams The params containing encrypted content and information.
   * @param decryptParams.encryptedContent The encrypted content encoded with base-64.
   * @param decryptParams.version The version of the payload.
   * @returns The decrypted content if successful. Else, null will be returned.
   */
  decryptFromSubmissionKey = (
    submissionSecretKey: string,
    decryptParams: DecryptParams
  ): DecryptedContentV3 | null => {
    try {
      const { encryptedContent } = decryptParams

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
      if (!determineIsFormFieldsV3(decryptedObject)) {
        throw new Error('Decrypted object does not fit expected shape')
      }

      const returnedObject: DecryptedContentV3 = {
        submissionSecretKey,
        responses: decryptedObject as FormFieldsV3,
      }

      return returnedObject
    } catch (err) {
      return null
    }
  }

  /**
   * Decrypts an encrypted submission and returns it.
   * @param formSecretKey The base-64 encoded form secret key for decrypting the submission.
   * @param decryptParams The params containing encrypted content, encrypted submission key and information.
   * @param decryptParams.encryptedContent The encrypted content encoded with base-64.
   * @param decryptParams.encryptedSubmissionSecretKey The encrypted submission secret key encoded with base-64.
   * @param decryptParams.version The version of the payload. Used to determine the decryption process to decrypt the content with.
   * @returns The decrypted content if successful. Else, null will be returned.
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
}
