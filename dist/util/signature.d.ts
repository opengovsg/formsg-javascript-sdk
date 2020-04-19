/**
 * Returns a signature from a basestring and secret key
 * @param basestring The data you want to sign.
 * @param secretKey 64-byte secret key in base64 encoding.
 * @return base64 encoded signature
 */
declare function sign(basestring: string, secretKey: string): string;
/**
 * Verifies a signature against a message and public key
 * @param message The message to verify
 * @param signature The base64 encoded signature generated from sign()
 * @param publicKey 32-byte public key in base64 encoding
 * @return True if verification checks out, false otherwise
 */
declare function verify(message: string, signature: string, publicKey: string): boolean;
export { sign, verify };
