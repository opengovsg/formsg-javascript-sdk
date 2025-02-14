import { getPublicKeys } from './util/keys'
import Crypto from './crypto'
import CryptoV3 from './crypto-v3'
import { PackageInitParams } from './types'
import Verification from './verification'
import Webhooks from './webhooks'

/**
 * Entrypoint into the FormSG SDK
 *
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string?} [config.mode] Optional. Initializes public key used for verifying and decrypting in this package. If `config.signingPublicKey` is given, this param will be ignored.
 * @param {string?} [config.webhookSecretKey] Optional. base64 secret key for signing webhooks. If provided, enables generating signature and headers to authenticate webhook data.
 * @param {VerificationOptions?} [config.verificationOptions] Optional. If provided, enables the usage of the verification module.
 */
export = async function (config: PackageInitParams = {}) {
  const { webhookSecretKey, verificationOptions, jwks, mode } = config
  const keyGetters = await getPublicKeys(jwks, mode)

  return {
    webhooks: new Webhooks({
      getPublicKey: keyGetters.signingPublicKey,
      secretKey: webhookSecretKey,
    }),
    crypto: new Crypto({
      getSigningPublicKey: keyGetters.signingPublicKey,
    }),
    cryptoV3: new CryptoV3(),
    verification: new Verification({
      getVerificationPublicKey: keyGetters.verificationPublicKey,
      secretKey: verificationOptions?.secretKey,
      transactionExpiry: verificationOptions?.transactionExpiry,
    }),
  }
}
