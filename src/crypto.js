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
 * @typedef {string} FieldType
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
 * Represents an answer provided to a form question.
 * @typedef {object} Response
 * @property {string} _id - The field ID of the response
 * @property {string} question - The form question
 * @property {string} answer - The answer to the form
 * @property {FieldType} fieldType - The field type
 */

/**
 * Encrypted basestring containing the submission public key,
 * nonce and encrypted data in base-64.
 * @typedef {string} EncryptedContent
 * A string in the format of <SubmissionPublicKey>;<Base64Nonce>:<Base64EncryptedData> 
 */

/**
 * Encrypts submission with a unique keypair for each submission
 * @param {String} formPublicKey base64
 * @param {Response[]} responses Array of Response objects
 * @returns {EncryptedContent}
 * @throws error if any of the encrypt methods fail
 */
function encrypt (formPublicKey, responses) {
  const submissionKeypair = generate()
  const nonce = nacl.randomBytes(24)
  const encrypted = encodeBase64(nacl.box(
    decodeUTF8(JSON.stringify(responses)),
    nonce,
    decodeBase64(formPublicKey),
    decodeBase64(submissionKeypair.secretKey)
  ))
  return `${submissionKeypair.publicKey};${encodeBase64(nonce)}:${encrypted}`
}

/**
 * Decrypts an encrypted submission.
 * @param {string} formPrivateKey base64
 * @param {EncryptedContent} encryptedContent encrypted string encoded in base64
 * @return {Object | null} Parsed JSON submission object if successful.
 */
function decrypt (formPrivateKey, encryptedContent) {
  try {
    const [ submissionPublicKey, nonceEncrypted ] = encryptedContent.split(';')
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
 * A base-64 encoded cryptographic keypair suitable for curve25519.
 * @typedef {Object} Keypair
 * @property {string} publicKey The base-64 encoded public key
 * @property {string} secretKey The base-64 encoded secret key
 */

/**
 * Generates a new keypair for encryption.
 * @returns {Keypair}
 */
function generate () {
  const kp = nacl.box.keyPair()
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey)
  }
}

/**
 * Returns true if a pair of public & secret keys are associated with each other
 * @param {string} publicKey 
 * @param {string} secretKey 
 */
function valid (publicKey, secretKey) {
  const plaintext = 'testtext'
  try {
    const ciphertext = encrypt(publicKey, plaintext)
    return decrypt(secretKey, ciphertext) === plaintext
  } catch (err) {
    return false
  }
}

module.exports = {
  encrypt,
  decrypt,
  generate,
  valid
}
