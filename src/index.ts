import { PackageInitParams } from './types'

import { getSigningPublicKey, getVerificationPublicKey } from './util/publicKey'

import Verification from './verification'
import Webhooks from './webhooks'
import Crypto from './crypto'

/**
 * Entrypoint into the FormSG SDK
 *
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string?} [config.mode] Optional. Initializes public key used for verifying and decrypting in this package. If `config.signingPublicKey` is given, this param will be ignored.
 * @param {string?} [config.webhookSecretKey] Optional. base64 secret key for signing webhooks. If provided, enables generating signature and headers to authenticate webhook data.
 * @param {VerificationOptions?} [config.verificationOptions] Optional. If provided, enables the usage of the verification module.
 */
export default function (config: PackageInitParams = {}) {
  const { webhookSecretKey, mode, verificationOptions } = config
  const signingPublicKey = getSigningPublicKey(mode || 'production')
  const verificationPublicKey = getVerificationPublicKey(mode || 'production')

  return {
    webhooks: new Webhooks({
      publicKey: signingPublicKey,
      secretKey: webhookSecretKey,
    }),
    crypto: new Crypto({ signingPublicKey }),
    verification: new Verification({
      publicKey: verificationPublicKey,
      secretKey: verificationOptions?.secretKey,
      transactionExpiry: verificationOptions?.transactionExpiry,
    }),
  }
}
