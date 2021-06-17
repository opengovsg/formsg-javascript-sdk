"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function determineIsFormFields(tbd) {
    if (!Array.isArray(tbd)) {
        return false;
    }
    // If there exists even a single internal response that does not fit the
    // shape, the object is not created properly.
    var filter = tbd.filter(function (internal) {
        // Have either answer or answerArray or is isHeader
        // Since empty strings are allowed, check using typeof.
        return (typeof internal.answer === 'string' ||
            Array.isArray(internal.answerArray) ||
            internal.isHeader) &&
            internal._id &&
            internal.fieldType &&
            internal.question;
    });
    return filter.length === tbd.length;
}
exports.determineIsFormFields = determineIsFormFields;
