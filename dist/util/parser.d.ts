declare type Signature = {
    v1: string;
    t: string;
    s: string;
    f: string;
};
/**
 * The constituents of the X-FormSG-Signature
 * @typedef {Object} Signature
 * @property {string} v1 - The ed25519 signature
 * @property {string} t - The epoch used for signing
 * @property {string} s - The submission ID
 * @property {string} f - The form ID
 */
/**
 * Parses the X-FormSG-Signature header into its constitutents
 * @param {string} header The X-FormSG-Signature header
 * @returns the signature header
 */
declare function parseSignatureHeader(header: string): Signature;
export { parseSignatureHeader };
