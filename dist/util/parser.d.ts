export declare type HeaderSignature = {
    v1: string;
    t: number;
    s: string;
    f: string;
};
export declare type VerificationSignature = {
    v: string;
    t: number;
    s: string;
    f: string;
};
/**
 * Parses the X-FormSG-Signature header into its constituents
 * @param header The X-FormSG-Signature header
 * @returns The signature header constituents
 */
export declare const parseSignatureHeader: (header: string) => HeaderSignature;
/**
 * Parses the verification signature into its constituent
 * @param signature The verification signature
 * @returns The verification signature constituents
 */
export declare const parseVerificationSignature: (signature: string) => VerificationSignature;
