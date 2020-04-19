"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var joi_1 = __importDefault(require("@hapi/joi"));
var FORM_FIELDS_SCHEMA = joi_1.default.array()
    .items(joi_1.default.object()
    .keys({
    _id: joi_1.default.string().required(),
    question: joi_1.default.string().required(),
    fieldType: joi_1.default.string().required(),
    answer: joi_1.default.string().allow(''),
    answerArray: joi_1.default.array(),
    filename: joi_1.default.string(),
    content: joi_1.default.binary(),
    isHeader: joi_1.default.boolean(),
    myInfo: joi_1.default.object(),
    signature: joi_1.default.string().allow(''),
})
    // only answer or answerArray can be present at once
    .xor('answer', 'answerArray')
    // if filename is present, content must be present
    .with('filename', 'content'))
    .required();
function determineIsFormFields(tbd) {
    return !FORM_FIELDS_SCHEMA.validate(tbd).error;
}
exports.determineIsFormFields = determineIsFormFields;
