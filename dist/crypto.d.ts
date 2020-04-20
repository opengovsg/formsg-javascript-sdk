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
/**
 * Helper function to encrypt file with a unique keypair for each submission.
 * @param blob The file to encrypt
 * @param formPublicKey The base-64 encoded public key
 * @returns Promise holding the encrypted file
 * @throws error if any of the encrypt methods fail
 */
declare function encryptFile(blob: Blob, formPublicKey: string): Promise<EncryptedFileContent>;
/**
 * Helper function to decrypt a file
 * @param formSecretKey Secret key as a base-64 string
 * @param encrypted Object returned from encryptFile function
 * @param encrypted.submissionPublicKey The submission public key as a base-64 string
 * @param encrypted.nonce The nonce as a base-64 string
 * @param encrypted.blob The encrypted file as a Blob object
 */
declare function decryptFile(formSecretKey: string, { submissionPublicKey, nonce, blob }: EncryptedFileContent): Promise<Blob | null>;
declare const _default: ({ mode }: Pick<PackageInitParams, "mode">) => {
    encrypt: typeof encrypt;
    decrypt: (formSecretKey: string, encryptedContent: string, verifiedContent?: string | undefined) => DecryptedContent | null;
    generate: typeof generate;
    valid: (publicKey: string, secretKey: string) => boolean;
    encryptFile: typeof encryptFile;
    decryptFile: typeof decryptFile;
};
/**
 * Provider that accepts configuration before returning the crypto module to
 * init.
 */
export = _default;
