'use strict'

const tweetnacl = require('tweetnacl')
const { decodeBase64, encodeUTF8 } = require('tweetnacl-util')

/**
 * Decrypts an encrypted submission.
 * @param {string} formPrivateKey base64
 * @param {string} encryptedSubmission encrypted string encoded in base64
 * @return {Object | null} Parsed JSON submission object if successful.
 */
function decrypt (formPrivateKey, encryptedSubmission) {
  try {
    const [ submissionPublicKey, nonceEncrypted ] = encryptedSubmission.split(';')
    const [ nonce, encrypted ] = nonceEncrypted.split(':').map(decodeBase64)
    const decrypted = tweetnacl.box.open(
      encrypted,
      nonce,
      decodeBase64(submissionPublicKey),
      decodeBase64(formPrivateKey)
    )
    return JSON.parse(encodeUTF8(decrypted))
  } catch (err) {
    return null
  }
}

module.exports = function () {
  return {
    decrypt,
  }
}
