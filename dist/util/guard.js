"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function determineIsFormFields(tbd) {
    // Not array, early return.
    if (!Array.isArray(tbd)) {
        return false;
    }
    // If there exists even a single internal response that does not fit the
    // shape, the object is not created properly.
    var filter = tbd.filter(function (internal) {
        return (internal.answer ||
            (Array.isArray(internal.answerArray) &&
                internal.answerArray.length > 0) ||
            internal.isHeader) &&
            internal.fieldType &&
            internal.question;
    });
    return filter.length === tbd.length;
}
exports.determineIsFormFields = determineIsFormFields;
