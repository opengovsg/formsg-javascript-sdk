declare const _default: (options?: PackageInitParams) => {
    webhooks: {
        authenticate: (header: string, uri: string) => void;
        generateSignature: Function;
        constructHeader: Function;
    };
    crypto: {
        encrypt: (encryptionPublicKey: string, msg: any, signingPrivateKey?: string | undefined) => string;
        decrypt: (formSecretKey: string, encryptedContent: string, verifiedContent?: string | undefined) => DecryptedContent | null;
        generate: () => Keypair;
        valid: (publicKey: string, secretKey: string) => boolean;
    };
};
/**
 * Entrypoint into the FormSG SDK
 * @param {Object} options
 * @param {string} [options.mode] If set to 'staging' this will initialise
 * the SDK for the FormSG staging environment
 * @param {string} [options.webhookSecretKey] Optional base64 secret key for signing webhooks
 */
export = _default;
