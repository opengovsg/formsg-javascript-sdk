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
export = async function (config: PackageInitParams = {}): Promise<{
  webhooks: Webhooks
  crypto: Crypto
  cryptoV3: CryptoV3
  verification: Verification
}> {
  const { webhookOptions, verificationOptions, jwks, mode } = config

  /**
   * signingPublicKey is used for decrypting signed verified content in the `crypto` module, and
   * also for verifying webhook signatures' authenticity in the `wehbooks` module.
   *
   * verificationPublicKey is used for verifying verified field signatures' authenticity in the `verification` module.
   *
   * Both keys are fetched from the JWKS endpoint if provided, else they are fetched from the static public keys.
   */
  const keyGetters = await getPublicKeys({
    jwks,
    webhookPublicKey: webhookOptions?.publicKey,
    verificationPublicKey: verificationOptions?.publicKey,
    mode,
  })

  return {
    webhooks: new Webhooks({
      getPublicKeys: keyGetters.signingPublicKeys,
      secretKey: webhookOptions?.secretKey,
    }),
    crypto: new Crypto({
      getSigningPublicKeys: keyGetters.signingPublicKeys,
    }),
    cryptoV3: new CryptoV3(),
    verification: new Verification({
      getVerificationPublicKeys: keyGetters.verificationPublicKeys,
      secretKey: verificationOptions?.secretKey,
      transactionExpiry: verificationOptions?.transactionExpiry,
    }),
  }
}
