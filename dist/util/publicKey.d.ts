import { PackageMode } from '../types';
/**
 * Retrieves the appropriate signing public key.
 * Defaults to production.
 * @param mode The package mode to retrieve the public key for.
 */
declare function getSigningPublicKey(mode?: PackageMode): string;
/**
 * Retrieves the appropriate verification public key.
 * Defaults to production.
 * @param mode The package mode to retrieve the public key for.
 */
declare function getVerificationPublicKey(mode?: PackageMode): string;
export { getSigningPublicKey, getVerificationPublicKey };
