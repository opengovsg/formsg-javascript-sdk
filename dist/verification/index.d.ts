import { VerificationAuthenticateOptions, VerificationOptions, VerificationSignatureOptions } from '../types';
export default class Verification {
    verificationPublicKey?: string;
    verificationSecretKey?: string;
    transactionExpiry?: number;
    constructor(params?: VerificationOptions);
    /**
     *  Verifies signature
     * @param {object} data
     * @param {string} data.signatureString
     * @param {number} data.submissionCreatedAt date in milliseconds
     * @param {string} data.fieldId
     * @param {string} data.answer
     * @param {string} data.publicKey
     */
    authenticate: ({ signatureString, submissionCreatedAt, fieldId, answer, }: VerificationAuthenticateOptions) => boolean;
    generateSignature: ({ transactionId, formId, fieldId, answer, }: VerificationSignatureOptions) => string;
}
