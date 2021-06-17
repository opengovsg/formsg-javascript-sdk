import Crypto from './crypto';
import { PackageInitParams } from './types';
import Verification from './verification';
import Webhooks from './webhooks';
declare const _default: (config?: PackageInitParams) => {
    webhooks: Webhooks;
    crypto: Crypto;
    verification: Verification;
};
/**
 * Entrypoint into the FormSG SDK
 *
 * @param {PackageInitParams} config Package initialization config parameters
 * @param {string?} [config.mode] Optional. Initializes public key used for verifying and decrypting in this package. If `config.signingPublicKey` is given, this param will be ignored.
 * @param {string?} [config.webhookSecretKey] Optional. base64 secret key for signing webhooks. If provided, enables generating signature and headers to authenticate webhook data.
 * @param {VerificationOptions?} [config.verificationOptions] Optional. If provided, enables the usage of the verification module.
 */
export = _default;
