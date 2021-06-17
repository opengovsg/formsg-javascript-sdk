"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper function to retrieve keys-values in a signature.
 * @param signature The signature to convert to a keymap
 * @returns The key-value map of the signature
 */
var signatureToKeyMap = function (signature) {
    return signature
        .split(',')
        .map(function (kv) { return kv.split(/=(.*)/); })
        .reduce(function (acc, _a) {
        var k = _a[0], v = _a[1];
        acc[k] = v;
        return acc;
    }, {});
};
/**
 * Parses the X-FormSG-Signature header into its constituents
 * @param header The X-FormSG-Signature header
 * @returns The signature header constituents
 */
exports.parseSignatureHeader = function (header) {
    var parsedSignature = signatureToKeyMap(header);
    parsedSignature.t = Number(parsedSignature.t);
    return parsedSignature;
};
/**
 * Parses the verification signature into its constituent
 * @param signature The verification signature
 * @returns The verification signature constituents
 */
exports.parseVerificationSignature = function (signature) {
    var parsedSignature = signatureToKeyMap(signature);
    parsedSignature.t = Number(parsedSignature.t);
    return parsedSignature;
};
