"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var url = __importStar(require("url"));
var errors_1 = require("../errors");
var signature_1 = require("./signature");
/**
 * Helper function to construct the basestring and verify the signature of an
 * incoming request
 * @param uri incoming request to verify
 * @param signatureHeader the X-FormSG-Signature header to verify against
 * @returns true if verification succeeds, false otherwise
 * @throws {WebhookAuthenticateError} if given signature header is malformed.
 */
var isSignatureHeaderValid = function (uri, signatureHeader, publicKey) {
    var signature = signatureHeader.v1, epoch = signatureHeader.t, submissionId = signatureHeader.s, formId = signatureHeader.f;
    if (!epoch || !signature || !submissionId || !formId) {
        throw new errors_1.WebhookAuthenticateError('X-FormSG-Signature header is invalid');
    }
    var baseString = url.parse(uri).href + "." + submissionId + "." + formId + "." + epoch;
    return signature_1.verify(baseString, signature, publicKey);
};
exports.isSignatureHeaderValid = isSignatureHeaderValid;
/**
 * Helper function to verify that the epoch submitted is recent and valid.
 * Prevents against replay attacks. Allows for negative time interval
 * in case of clock drift between Form servers and recipient server.
 * @param epoch The number of milliseconds since 1 Jan 1970 00:00:00 UTC.
 * @param expiry Duration of expiry in milliseconds. The default is 5 minutes.
 * @returns true if the epoch given has exceeded expiry duration calculated from current time.
 */
var hasEpochExpired = function (epoch, expiry) {
    if (expiry === void 0) { expiry = 300000; }
    var difference = Math.abs(Date.now() - epoch);
    return difference > expiry;
};
exports.hasEpochExpired = hasEpochExpired;
