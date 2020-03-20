const webhooks = require('./src/webhooks')
const crypto = require('./src/crypto')

/**
 * Entrypoint into the FormSG SDK
 * @param {Object} options
 * @param {string} [options.mode] If set to 'staging' this will initialise
 * the SDK for the FormSG staging environment
 * @param {string} [options.webhookSecretKey] Optional base64 secret key for signing webhooks
 */
module.exports = function ({
  mode='production',
  webhookSecretKey,
} = {}) {
    return {
      webhooks: webhooks({ mode, webhookSecretKey }),
      crypto: crypto(),
    }
}
