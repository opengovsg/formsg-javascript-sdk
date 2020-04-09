const WEBHOOK_KEYS = require('../../resource/webhook-keys')
const STAGE = require('./stage')

/**
 * Retrieves the appropriate public key.
 * Defaults to production.
 * @param {string} [mode] One of 'staging' | 'production'
 */
export function getPublicKey (mode) {
  switch (mode) {
    case STAGE.staging:
      return WEBHOOK_KEYS.staging.publicKey
    case STAGE.test:
      return WEBHOOK_KEYS.test.publicKey
    default:
      return WEBHOOK_KEYS.production.publicKey
  }
}