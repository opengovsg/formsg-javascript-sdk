import { VerificationBasestringOptions } from '../types';
/**
 * Checks if signature was made within the given expiry range before
 * submission was created.
 * @param signatureTime ms
 * @param submissionCreatedAt ms
 */
export declare const isSignatureTimeValid: (signatureTime: number, submissionCreatedAt: number, transactionExpiry: number) => boolean;
/**
 * Formats given data into a string for signing
 */
export declare const formatToBaseString: ({ transactionId, formId, fieldId, answer, time, }: VerificationBasestringOptions) => string;
