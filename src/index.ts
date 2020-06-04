import crypto from './crypto'
import { PackageInitParams } from './types'
import verification from './verification'
import webhooks from './webhooks'
/**
 * Entrypoint into the FormSG SDK
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string?} [config.publicKey] Optional. If provided, this public key will be used instead to authenticate or verify signed objects passed into this package.
 * @param {string?} [config.mode] Optional. Initializes public key used for verifying and decrypting in this package. If `config.signingPublicKey` is given, this param will be ignored.
 * @param {string?} [config.webhookSecretKey] Optional base64 secret key for signing webhooks
 */
export = function (config: PackageInitParams = {}) {
  return {
    webhooks: webhooks(config),
    crypto: crypto(config),
    verification: verification(config),
  }
}
