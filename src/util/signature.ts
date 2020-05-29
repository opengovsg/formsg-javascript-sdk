import * as tweetnacl from 'tweetnacl'
import { encode as encodeUTF8 } from '@stablelib/utf8'
import { encode as encodeBase64, decode as decodeBase64 } from '@stablelib/base64'

/**
 * Returns a signature from a basestring and secret key
 * @param basestring The data you want to sign.
 * @param secretKey 64-byte secret key in base64 encoding.
 * @return base64 encoded signature
 */
function sign(basestring: string, secretKey: string): string {
  return encodeBase64(
    tweetnacl.sign.detached(encodeUTF8(basestring), decodeBase64(secretKey))
  )
}

/**
 * Verifies a signature against a message and public key
 * @param message The message to verify
 * @param signature The base64 encoded signature generated from sign()
 * @param publicKey 32-byte public key in base64 encoding
 * @return True if verification checks out, false otherwise
 */
function verify(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  return tweetnacl.sign.detached.verify(
    encodeUTF8(message),
    decodeBase64(signature),
    decodeBase64(publicKey)
  )
}

export { sign, verify }
