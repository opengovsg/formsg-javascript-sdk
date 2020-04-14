/**
 * Retrieves the appropriate public key.
 * Defaults to production.
 * @param mode The package mode to retrieve the public key for.
 */
declare function getPublicKey(mode?: PackageMode): string;
export { getPublicKey };
