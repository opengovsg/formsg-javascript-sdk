const webhooks = require('./webhooks')
const crypto = require('./crypto')

/**
 * Entrypoint into the FormSG SDK
 * @param {Object} options
 * @param {string} [options.mode] If set to 'staging' this will initialise
 * the SDK for the FormSG staging environment
 * @param {string} [options.webhookSecretKey] Optional base64 secret key for signing webhooks
 */
module.exports = function (options = {}) {
  const {
    mode,
    webhookSecretKey,
  } = options

  return {
    webhooks: webhooks({
      mode: mode || 'production',
      webhookSecretKey
    }),
    crypto: crypto({
      mode: mode || 'production',
    }),
  }
}
