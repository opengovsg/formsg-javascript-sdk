import nacl from 'tweetnacl'
import { encode as encodeUTF8 } from '@stablelib/utf8'
import { decode as decodeBase64 } from '@stablelib/base64'
import basestring from './basestring'

export default function ( publicKey: string, transactionExpirySeconds: number ): Function {
  /*
    *  Checks if signature was made within TRANSACTION_EXPIRE_AFTER_SECONDS before submission was created
    * @param {Number} signatureTime ms
    * @param {Number} submissionCreatedAt ms
    */
  function isSignatureTimeValid(signatureTime: number, submissionCreatedAt: number): boolean {
    const maxTime = submissionCreatedAt
    const minTime = maxTime - transactionExpirySeconds * 1000
    return signatureTime > minTime && signatureTime < maxTime
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
  function authenticate({ signatureString, submissionCreatedAt, fieldId, answer }: VerificationAuthenticateOptions) {
    try {
      const { v: transactionId, t: time, f: formId, s: signature } = signatureString
        .split(',')
        .reduce(function (acc: {[key: string]: string}, v: string){
          const i = v.indexOf('=')
          acc[v.substring(0, i)] = v.substring(i + 1)
          return acc
        }, {})
    
      const signatureDate = +time
      if (isSignatureTimeValid(signatureDate, submissionCreatedAt)) {
        const data = basestring({ transactionId, formId, fieldId, answer, time: signatureDate })
        return nacl.sign.detached.verify(
          encodeUTF8(data),
          decodeBase64(signature),
          decodeBase64(publicKey)
        )
      } else {
        console.info(`Signature was expired for signatureString="${signatureString}" signatureDate="${signatureDate}" submissionCreatedAt="${submissionCreatedAt}"`)
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

  return authenticate
}
