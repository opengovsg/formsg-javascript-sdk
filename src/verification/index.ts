/**
 * @file Manages verification of otp form fields (email, sms, whatsapp)
 * @author Jean Tan
 */
import nacl from 'tweetnacl'
import { decodeBase64, decodeUTF8, encodeBase64 } from 'tweetnacl-util'

import { MissingPublicKeyError, MissingSecretKeyError } from '../errors'
import {
  VerificationAuthenticateOptions,
  VerificationOptions,
  VerificationSignatureOptions,
} from '../types'
import { parseVerificationSignature } from '../util/parser'

import { formatToBaseString, isSignatureTimeValid } from './utils'

export default class Verification {
  getVerificationPublicKeys?: (keyId?: string) => Promise<string[]>
  verificationSecretKey?: string
  transactionExpiry?: number

  constructor({
    getVerificationPublicKeys,
    secretKey,
    transactionExpiry,
  }: VerificationOptions) {
    this.getVerificationPublicKeys = getVerificationPublicKeys
    this.verificationSecretKey = secretKey
    this.transactionExpiry = transactionExpiry
  }

  /**
   *  Verifies signature
   * @param {object} data
   * @param {string} data.signatureString
   * @param {number} data.submissionCreatedAt date in milliseconds
   * @param {string} data.fieldId
   * @param {string} data.answer
   * @param {string} data.publicKey
   */
  authenticate = async ({
    signatureString,
    submissionCreatedAt,
    fieldId,
    answer,
  }: VerificationAuthenticateOptions) => {
    if (!this.transactionExpiry) {
      throw new Error(
        'Provide a transaction expiry when when initializing the FormSG SDK to use this function.'
      )
    }

    if (!this.getVerificationPublicKeys) {
      throw new MissingPublicKeyError()
    }

    try {
      const {
        v: transactionId,
        t: time,
        f: formId,
        s: signature,
        kid: keyId,
      } = parseVerificationSignature(signatureString)

      if (!time) {
        throw new Error('Malformed signature string was passed into function')
      }

      const verificationPublicKeys = await this.getVerificationPublicKeys(keyId)
      if (!verificationPublicKeys.length) {
        throw new MissingPublicKeyError()
      }

      if (
        isSignatureTimeValid(time, submissionCreatedAt, this.transactionExpiry)
      ) {
        const data = formatToBaseString({
          transactionId,
          formId,
          fieldId,
          answer,
          time,
        })

        // Try each public key until one works
        for (const publicKey of verificationPublicKeys) {
          if (
            nacl.sign.detached.verify(
              decodeUTF8(data),
              decodeBase64(signature),
              decodeBase64(publicKey)
            )
          ) {
            return true
          }
        }
        return false
      } else {
        console.info(
          `Signature was expired for signatureString="${signatureString}" signatureDate="${time}" submissionCreatedAt="${submissionCreatedAt}"`
        )
        return false
      }
    } catch (error) {
      console.error(`An error occurred for \
            signatureString="${signatureString}" \
            submissionCreatedAt="${submissionCreatedAt}" \
            fieldId="${fieldId}" \
            answer="${answer}" \
            error="${error}"`)
      return false
    }
  }

  generateSignature = ({
    transactionId,
    formId,
    fieldId,
    answer,
    keyId,
  }: VerificationSignatureOptions): string => {
    if (!this.verificationSecretKey) {
      throw new MissingSecretKeyError(
        'Provide a secret key when when initializing the Verification class to use this function.'
      )
    }

    const time = Date.now()
    const data = formatToBaseString({
      transactionId,
      formId,
      fieldId,
      answer,
      time,
    })
    const signature = nacl.sign.detached(
      decodeUTF8(data),
      decodeBase64(this.verificationSecretKey)
    )

    const result = `f=${formId},v=${transactionId},t=${time},s=${encodeBase64(
      signature
    )}`
    if (keyId) {
      return `${result},kid=${keyId}`
    }

    return result
  }
}
