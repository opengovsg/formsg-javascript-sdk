'use strict'

const tweetnacl = require('tweetnacl')
const {
  decodeUTF8,
  encodeBase64,
  decodeBase64,
} = require('tweetnacl-util')

/**
 * Returns a signature from a basestring and secret key
 * @param  {string} basestring   The data you want to sign.
 * @param  {string} secretKey 64-byte secret key in base64 encoding.
 * @return {string} base64 encoded signature
 */
function sign (basestring, secretKey) {
  return encodeBase64(
    tweetnacl.sign.detached(
      decodeUTF8(basestring),
      decodeBase64(secretKey)
    )
  )
}

/**
 * Verifies a signature against a message and public key
 * @param {string} message The message to verify
 * @param {string} signature The base64 encoded signature generated from sign()
 * @param {string} publicKey 32-byte public key in base64 encoding
 * @return {Boolean} True if verification checks out, false otherwise
 */
function verify (message, signature, publicKey) {
  return tweetnacl.sign.detached.verify(
    decodeUTF8(message),
    decodeBase64(signature),
    decodeBase64(publicKey)
  )
}

module.exports = {
  sign,
  verify
}
