const SIGNING_KEYS = require('../../resource/signing-keys')
const STAGE = require('./stage')

/**
 * Retrieves the appropriate public key.
 * Defaults to production.
 * @param {'staging'|'production'|'development'} mode One of 'staging' |'production' | 'development'
 */
function getPublicKey (mode) {
  switch (mode) {
    case STAGE.development:
    case STAGE.staging:
      return SIGNING_KEYS.staging.publicKey
    case STAGE.test:
      return SIGNING_KEYS.test.publicKey
    default:
      return SIGNING_KEYS.production.publicKey
  }
}

module.exports = {
  getPublicKey,
}
