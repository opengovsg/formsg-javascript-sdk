"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function parseSignatureHeader(header) {
    var parsedSignature = header
        .split(',')
        .map(function (kv) { return kv.split(/=(.*)/); })
        .reduce(function (acc, _a) {
        var k = _a[0], v = _a[1];
        acc[k] = v;
        return acc;
    }, {});
    return parsedSignature;
}
exports.parseSignatureHeader = parseSignatureHeader;
