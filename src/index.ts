import crypto from './crypto'
import { PackageInitParams } from './types'
import verification from './verification'
import webhooks from './webhooks'
/**
 * Entrypoint into the FormSG SDK
 * @param {Object} options
 * @param {string} [options.mode] If set to 'staging' this will initialise
 * the SDK for the FormSG staging environment
 * @param {string} [options.webhookSecretKey] Optional base64 secret key for signing webhooks
 */
export = function (options: PackageInitParams = {}) {
  const { mode, webhookSecretKey, verificationOptions } = options

  return {
    webhooks: webhooks({
      mode: mode || 'production',
      webhookSecretKey,
    }),
    crypto: crypto({
      mode: mode || 'production',
    }),
    verification: verification({
      mode: mode || 'production',
      verificationOptions,
    }),
  }
}
