'use strict'

const nacl = require('tweetnacl')
const {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8
} = require('tweetnacl-util')

/**
 * A field type available in FormSG as a string
 * @typedef {FieldType}
 * @type {string}
 * @example
 * 'section'
 * 'radiobutton'
 * 'dropdown'
 * 'checkbox'
 * 'nric'
 * 'email'
 * 'table'
 * 'number'
 * 'rating'
 * 'yes_no'
 * 'decimal'
 * 'textfield' // Short Text
 * 'textarea' // Long Text
 * 'attachment'
 * 'date'
 * 'mobile'
 */

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Response}
 * @property {string} _id - The field ID of the response
 * @property {string} question - The form question
 * @property {string} answer - The answer to the form
 * @property {FieldType} fieldType - The field type
 */

/**
 * Encrypts submission with a unique keypair for each submission
 * @param {String} formPublicKey base64
 * @param {Response[]} responses Array of Response objects
 * @returns encrypted basestring containing the submission public key,
 * nonce and encrypted data in base64
 * @throws error if any of the encrypt methods fail
 */
function encrypt (formPublicKey, responses) {
  const submissionKeypair = generate()
  const nonce = nacl.randomBytes(24)
  const encrypted = encodeBase64(nacl.box(
    decodeUTF8(JSON.stringify(responses)),
    nonce,
    decodeBase64(formPublicKey),
    decodeBase64(submissionPrivateKey)
  ))
  return `${submissionKeypair.publicKey};${encodeBase64(nonce)}:${encrypted}`
}

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
    const decrypted = nacl.box.open(
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

/**
 * A cryptographic keypair
 * @typedef {Keypair}
 * @property {string} publicKey The base-64 encoded public key
 * @property {string} privateKey The base-64 encoded privateKey key
 */

/**
 * Generates a new keypair for encryption.
 * @returns {Keypair}
 */
function generate () {
  const kp = nacl.box.keyPair()
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  }
}

/**
 * Checks whether a public & private keypair are associated with each other
 * @param {string} publicKey 
 * @param {string} secretKey 
 */
function valid (publicKey, secretKey) {
  const text = 'testtext'
  try {
    const encrypted = encryptSubmission(publicKey, text)
    const decrypted = decryptSubmission(secretKey, encrypted)
    return decrypted === text
  } catch (err) {
    return false
  }
}

module.exports = function () {
  return {
    encrypt,
    decrypt,
    generate,
    valid,
  }
}
