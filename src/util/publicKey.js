const SIGNING_KEYS = require('../../resource/signing-keys')
const STAGE = require('./stage')

/**
 * Retrieves the appropriate public key.
 * Defaults to production.
 * @param {string} [mode] One of 'staging' | 'production'
 */
function getPublicKey (mode) {
  switch (mode) {
    case STAGE.staging:
      return SIGNING_KEYS.staging.publicKey
    case STAGE.development:
    case STAGE.test:
      return SIGNING_KEYS.test.publicKey
    default:
      return SIGNING_KEYS.production.publicKey
  }
}

module.exports = {
  getPublicKey,
}
