"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file Manages verification of otp form fields (email, sms, whatsapp)
 * @author Jean Tan
 */
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var tweetnacl_util_1 = require("tweetnacl-util");
var errors_1 = require("../errors");
var parser_1 = require("../util/parser");
var utils_1 = require("./utils");
var Verification = /** @class */ (function () {
    function Verification(params) {
        var _this = this;
        /**
         *  Verifies signature
         * @param {object} data
         * @param {string} data.signatureString
         * @param {number} data.submissionCreatedAt date in milliseconds
         * @param {string} data.fieldId
         * @param {string} data.answer
         * @param {string} data.publicKey
         */
        this.authenticate = function (_a) {
            var signatureString = _a.signatureString, submissionCreatedAt = _a.submissionCreatedAt, fieldId = _a.fieldId, answer = _a.answer;
            if (!_this.transactionExpiry) {
                throw new Error('Provide a transaction expiry when when initializing the FormSG SDK to use this function.');
            }
            if (!_this.verificationPublicKey) {
                throw new errors_1.MissingPublicKeyError();
            }
            try {
                var _b = parser_1.parseVerificationSignature(signatureString), transactionId = _b.v, time = _b.t, formId = _b.f, signature = _b.s;
                if (!time) {
                    throw new Error('Malformed signature string was passed into function');
                }
                if (utils_1.isSignatureTimeValid(time, submissionCreatedAt, _this.transactionExpiry)) {
                    var data = utils_1.formatToBaseString({
                        transactionId: transactionId,
                        formId: formId,
                        fieldId: fieldId,
                        answer: answer,
                        time: time,
                    });
                    return tweetnacl_1.default.sign.detached.verify(tweetnacl_util_1.decodeUTF8(data), tweetnacl_util_1.decodeBase64(signature), tweetnacl_util_1.decodeBase64(_this.verificationPublicKey));
                }
                else {
                    console.info("Signature was expired for signatureString=\"" + signatureString + "\" signatureDate=\"" + time + "\" submissionCreatedAt=\"" + submissionCreatedAt + "\"");
                    return false;
                }
            }
            catch (error) {
                console.error("An error occurred for             signatureString=\"" + signatureString + "\"             submissionCreatedAt=\"" + submissionCreatedAt + "\"             fieldId=\"" + fieldId + "\"             answer=\"" + answer + "\"             error=\"" + error + "\"");
                return false;
            }
        };
        this.generateSignature = function (_a) {
            var transactionId = _a.transactionId, formId = _a.formId, fieldId = _a.fieldId, answer = _a.answer;
            if (!_this.verificationSecretKey) {
                throw new errors_1.MissingSecretKeyError('Provide a secret key when when initializing the Verification class to use this function.');
            }
            var time = Date.now();
            var data = utils_1.formatToBaseString({
                transactionId: transactionId,
                formId: formId,
                fieldId: fieldId,
                answer: answer,
                time: time,
            });
            var signature = tweetnacl_1.default.sign.detached(tweetnacl_util_1.decodeUTF8(data), tweetnacl_util_1.decodeBase64(_this.verificationSecretKey));
            return "f=" + formId + ",v=" + transactionId + ",t=" + time + ",s=" + tweetnacl_util_1.encodeBase64(signature);
        };
        this.verificationPublicKey = params === null || params === void 0 ? void 0 : params.publicKey;
        this.verificationSecretKey = params === null || params === void 0 ? void 0 : params.secretKey;
        this.transactionExpiry = params === null || params === void 0 ? void 0 : params.transactionExpiry;
    }
    return Verification;
}());
exports.default = Verification;
