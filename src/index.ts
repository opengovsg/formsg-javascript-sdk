import { PackageInitParams } from './types'

import { getSigningPublicKey, getVerificationPublicKey } from './util/publicKey'

import Verification from './verification'
import Webhooks from './webhooks'
import Crypto from './crypto'

/**
 * Deprecated entrypoint into the FormSG SDK
 * Deprecated since January 2021.
 *
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string?} [config.mode] Optional. Initializes public key used for verifying and decrypting in this package. If `config.signingPublicKey` is given, this param will be ignored.
 * @param {string?} [config.webhookSecretKey] Optional. base64 secret key for signing webhooks. If provided, enables generating signature and headers to authenticate webhook data.
 * @param {VerificationOptions?} [config.verificationOptions] Optional. If provided, enables the usage of the verification module.
 */

/**
 * Entrypoint into the FormSG SDK
 *
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string} [config.signingPublicKey] This public key is used to either encrypt objects or verify webhook objects passed into this package.
 * @param {string?} [config.webhookSecretKey] Optional. base64 secret key for signing webhooks. If provided, enables generating signature and headers to authenticate webhook data.
 * @param {VerificationOptions?} [config.verificationOptions] Optional. If provided, enables the usage of the verification module.
 */
export default function (config: PackageInitParams = {}) {
  const { webhookSecretKey, mode, verificationOptions } = config
  // Backwards compatible way to also allow for `mode` parameter until it is fully removed.
  const publicSigningKey =
    config.signingPublicKey || getSigningPublicKey(mode || 'production')
  const verificationPublicKey =
    config.verificationOptions?.publicKey ||
    getVerificationPublicKey(mode || 'production')

  if (typeof mode !== 'undefined') {
    console.warn(
      'Initializing the FormSG SDK with the `mode` parameter is now deprecated. Please switch to the publicKey parameter instead.'
    )
  }

  return {
    webhooks: new Webhooks({
      publicKey: publicSigningKey,
      secretKey: webhookSecretKey,
    }),
    crypto: new Crypto({ publicSigningKey }),
    verification: new Verification({
      publicKey: verificationPublicKey,
      secretKey: verificationOptions?.secretKey,
      transactionExpiry: verificationOptions?.transactionExpiry,
    }),
  }
}
