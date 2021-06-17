export declare type PackageInitParams = {
    /** base64 secret key for signing webhooks. If provided, enables generating signature and headers to authenticate webhook data. */
    webhookSecretKey?: string;
    /** If provided, enables the usage of the verification module. */
    verificationOptions?: VerificationOptions;
    /** Initializes public key used for verifying and decrypting in this package. If not given, will default to "production". */
    mode?: PackageMode;
};
export declare type FieldType = 'section' | 'radiobutton' | 'dropdown' | 'checkbox' | 'nric' | 'email' | 'table' | 'number' | 'rating' | 'yes_no' | 'decimal' | 'textfield' | 'textarea' | 'attachment' | 'date' | 'mobile' | 'homeno';
export declare type FormField = {
    _id: string;
    question: string;
    fieldType: FieldType;
    isHeader?: boolean;
    signature?: string;
} & ({
    answer: string;
    answerArray?: never;
} | {
    answer?: never;
    answerArray: string[] | string[][];
});
export declare type EncryptedContent = string;
export declare type EncryptedAttachmentRecords = Record<string, string>;
export interface DecryptParams {
    encryptedContent: EncryptedContent;
    version: number;
    verifiedContent?: EncryptedContent;
    attachmentDownloadUrls?: EncryptedAttachmentRecords;
}
export declare type DecryptedContent = {
    responses: FormField[];
    verified?: Record<string, any>;
};
export declare type DecryptedFile = {
    filename: string;
    content: Uint8Array;
};
export declare type DecryptedAttachments = Record<string, DecryptedFile>;
export declare type DecryptedContentAndAttachments = {
    content: DecryptedContent;
    attachments: DecryptedAttachments;
};
export declare type EncryptedFileContent = {
    submissionPublicKey: string;
    nonce: string;
    binary: Uint8Array;
};
export declare type EncryptedAttachmentContent = {
    encryptedFile: {
        submissionPublicKey: string;
        nonce: string;
        binary: string;
    };
};
export declare type Keypair = {
    publicKey: string;
    secretKey: string;
};
export declare type PackageMode = 'staging' | 'production' | 'development' | 'test';
export declare type VerificationOptions = {
    publicKey?: string;
    secretKey?: string;
    transactionExpiry?: number;
};
export declare type VerifiedAnswer = {
    fieldId: string;
    answer: string;
};
export declare type VerificationSignatureOptions = VerifiedAnswer & {
    transactionId: string;
    formId: string;
};
export declare type VerificationBasestringOptions = VerificationSignatureOptions & {
    time: number;
};
export declare type VerificationAuthenticateOptions = VerifiedAnswer & {
    signatureString: string;
    submissionCreatedAt: number;
};
