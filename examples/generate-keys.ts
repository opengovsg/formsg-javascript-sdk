import * as nacl from 'tweetnacl'
import crypto from 'crypto'

// Generate Ed25519 keypair using NaCl
const generateKeysAndJWKS = () => {
  const generateUuidKid = () => {
    return crypto.randomUUID()
  }

  const keypair = nacl.sign.keyPair()

  // generate timestamp to epoch
  const timestamp = Math.floor(Date.now() / 1000)

  // Convert keys to Base64 for storage/display
  const publicKeyBase64 = Buffer.from(keypair.publicKey).toString('base64')
  const privateKeyBase64 = Buffer.from(keypair.secretKey).toString('base64')

  // Convert public key to base64url format (required for JWKS format)
  const publicKeyBase64Url = publicKeyBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return {
    privateKey: privateKeyBase64,
    publicKey: publicKeyBase64,
    publicKeyBase64Url: publicKeyBase64Url,
    kid: `${timestamp}-${generateUuidKid()}`,
  }
}

const result = generateKeysAndJWKS()
console.log('Generated Ed25519 keypair:')
console.log('-------------------------')
console.log('Private key (base64):')
console.log(result.privateKey)
console.log('\nPublic key (base64):')
console.log(result.publicKey)
console.log('\nPublic key (base64url, what to put in JWKS):')
console.log(result.publicKeyBase64Url)
console.log('\nExample Key ID (UUID format):')
console.log(result.kid)
