const nacl = require('tweetnacl')
const crypto = require('crypto') // For UUID generation

// Generate Ed25519 keypair using NaCl
const generateKeysAndJWKS = () => {
  // Generate a key ID (kid) - two options:
  // 1. UUID-based (cryptographically random)
  const generateUuidKid = () => {
    return crypto.randomUUID()
  }

  const keypair = nacl.sign.keyPair()
  // console.log('keypair', keypair)

  // Convert keys to Base64 for storage/display
  const publicKeyBase64 = Buffer.from(keypair.publicKey).toString('base64')
  const privateKeyBase64 = Buffer.from(keypair.secretKey).toString('base64')

  // Convert public key to base64url format (required for JWK)
  const publicKeyBase64Url = publicKeyBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return {
    privateKey: privateKeyBase64,
    publicKey: publicKeyBase64,
    publicKeyBase64Url: publicKeyBase64Url,
    kid: generateUuidKid(),
  }
}

// Run the function and output results
const result = generateKeysAndJWKS()

console.log('Generated Ed25519 keypair:')
console.log('-------------------------')
console.log('Private key (base64):')
console.log(result.privateKey)
console.log('\nPublic key (base64):')
console.log(result.publicKey)
console.log('\nPublic key (base64url, what to put in JWKS):')
console.log(result.publicKeyBase64Url)
console.log('\nKey ID (UUID format):')
console.log(result.kid)
