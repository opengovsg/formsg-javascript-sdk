import { PackageInitParams } from './types'

import { getSigningPublicKey, getVerificationPublicKey } from './util/publicKey'

import Verification from './verification'
import Webhooks from './webhooks'
import Crypto from './crypto'

/**
 * Entrypoint into the FormSG SDK
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string} [config.publicKey] This public key is used to authenticate or verify signed objects passed into this package.
 * @param {string?} [config.webhookSecretKey] Optional base64 secret key for signing webhooks
 *//**
 * Deprecated entrypoint into the FormSG SDK
 *
 * @deprecated since January 2021
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string?} [config.publicKey] Optional. If provided, this public key will be used instead to authenticate or verify signed objects passed into this package.
 * @param {string?} [config.mode] Optional. Initializes public key used for verifying and decrypting in this package. If `config.signingPublicKey` is given, this param will be ignored.
 * @param {string?} [config.webhookSecretKey] Optional base64 secret key for signing webhooks
 */
export = function (config: PackageInitParams = {}) {
  const { publicKey, webhookSecretKey, mode, verificationOptions } = config
  const encryptionPublicKey =
    publicKey || getSigningPublicKey(mode || 'production')
  const verificationPublicKey =
    publicKey || getVerificationPublicKey(mode || 'production')

  if (typeof mode !== 'undefined') {
    console.warn('Initializing the FormSG SDK is now deprecated. Please switch to the publicKey parameter instead.')
  }

  return {
    webhooks: new Webhooks({
      publicKey: encryptionPublicKey,
      secretKey: webhookSecretKey,
    }),
    crypto: new Crypto({ publicSigningKey: encryptionPublicKey }),
    verification: new Verification({
      verificationPublicKey,
      transactionExpiry: verificationOptions?.transactionExpiry,
      verificationSecretKey: verificationOptions?.secretKey,
    }),
  }
}
