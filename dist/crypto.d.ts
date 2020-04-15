/**
 * Encrypt input with a unique keypair for each submission
 * @param encryptionPublicKey The base-64 encoded public key for encrypting.
 * @param msg The message to encrypt, will be stringified.
 * @param signingPrivateKey Optional. Must be a base-64 encoded private key,  will be used to signing the given msg param prior to encrypting.
 * @returns The encrypted basestring.
 */
declare function encrypt(msg: any, encryptionPublicKey: string, signingPrivateKey?: string): EncryptedContent;
/**
 * Generates a new keypair for encryption.
 * @returns The generated keypair.
 */
declare function generate(): Keypair;
declare const _default: ({ mode }: Pick<PackageInitParams, "mode">) => {
    encrypt: typeof encrypt;
    decrypt: (formSecretKey: string, encryptedContent: string, verifiedContent?: string | undefined) => DecryptedContent | null;
    generate: typeof generate;
    valid: (publicKey: string, secretKey: string) => boolean;
};
/**
 * Provider that accepts configuration before returning the crypto module to init.
 */
export = _default;
