declare const _default: (options?: PackageInitParams) => {
    webhooks: {
        authenticate: (header: string, uri: string) => void;
        generateSignature: (({ uri, submissionId, formId, epoch, }: {
            uri: string;
            submissionId: Object;
            formId: string;
            epoch: number;
        }) => string) | (() => void);
        constructHeader: (({ epoch, submissionId, formId, signature, }: {
            epoch: number;
            submissionId: string;
            formId: string;
            signature: string;
        }) => string) | (() => void);
    };
    crypto: {
        encrypt: (msg: any, encryptionPublicKey: string, signingPrivateKey?: string | undefined) => string;
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
