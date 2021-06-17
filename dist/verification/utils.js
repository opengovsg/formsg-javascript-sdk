"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks if signature was made within the given expiry range before
 * submission was created.
 * @param signatureTime ms
 * @param submissionCreatedAt ms
 */
exports.isSignatureTimeValid = function (signatureTime, submissionCreatedAt, transactionExpiry) {
    var maxTime = submissionCreatedAt;
    var minTime = maxTime - transactionExpiry * 1000;
    return signatureTime > minTime && signatureTime < maxTime;
};
/**
 * Formats given data into a string for signing
 */
exports.formatToBaseString = function (_a) {
    var transactionId = _a.transactionId, formId = _a.formId, fieldId = _a.fieldId, answer = _a.answer, time = _a.time;
    return transactionId + "." + formId + "." + fieldId + "." + answer + "." + time;
};
