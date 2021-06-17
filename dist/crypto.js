"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var tweetnacl_util_1 = require("tweetnacl-util");
var crypto_1 = require("./util/crypto");
var validate_1 = require("./util/validate");
var errors_1 = require("./errors");
var Crypto = /** @class */ (function () {
    function Crypto(_a) {
        var _this = this;
        var signingPublicKey = (_a === void 0 ? {} : _a).signingPublicKey;
        /**
         * Encrypt input with a unique keypair for each submission
         * @param encryptionPublicKey The base-64 encoded public key for encrypting.
         * @param msg The message to encrypt, will be stringified.
         * @param signingPrivateKey Optional. Must be a base-64 encoded private key. If given, will be used to signing the given msg param prior to encrypting.
         * @returns The encrypted basestring.
         */
        this.encrypt = function (msg, encryptionPublicKey, signingPrivateKey) {
            var processedMsg = tweetnacl_util_1.decodeUTF8(JSON.stringify(msg));
            if (signingPrivateKey) {
                processedMsg = tweetnacl_1.default.sign(processedMsg, tweetnacl_util_1.decodeBase64(signingPrivateKey));
            }
            return crypto_1.encryptMessage(processedMsg, encryptionPublicKey);
        };
        /**
         * Decrypts an encrypted submission and returns it.
         * @param formSecretKey The base-64 secret key of the form to decrypt with.
         * @param decryptParams The params containing encrypted content and information.
         * @param decryptParams.encryptedContent The encrypted content encoded with base-64.
         * @param decryptParams.version The version of the payload. Used to determine the decryption process to decrypt the content with.
         * @param decryptParams.verifiedContent Optional. The encrypted and signed verified content. If given, the signingPublicKey will be used to attempt to open the signed message.
         * @returns The decrypted content if successful. Else, null will be returned.
         * @throws {MissingPublicKeyError} if a public key is not provided when instantiating this class and is needed for verifying signed content.
         */
        this.decrypt = function (formSecretKey, decryptParams) {
            try {
                var encryptedContent = decryptParams.encryptedContent, verifiedContent = decryptParams.verifiedContent;
                // Do not return the transformed object in `_decrypt` function as a signed
                // object is not encoded in UTF8 and is encoded in Base-64 instead.
                var decryptedContent = crypto_1.decryptContent(formSecretKey, encryptedContent);
                if (!decryptedContent) {
                    throw new Error('Failed to decrypt content');
                }
                var decryptedObject = JSON.parse(tweetnacl_util_1.encodeUTF8(decryptedContent));
                if (!validate_1.determineIsFormFields(decryptedObject)) {
                    throw new Error('Decrypted object does not fit expected shape');
                }
                var returnedObject = {
                    responses: decryptedObject,
                };
                if (verifiedContent) {
                    if (!_this.signingPublicKey) {
                        throw new errors_1.MissingPublicKeyError('Public signing key must be provided when instantiating the Crypto class in order to verify verified content');
                    }
                    // Only care if it is the correct shape if verifiedContent exists, since
                    // we need to append it to the end.
                    // Decrypted message must be able to be authenticated by the public key.
                    var decryptedVerifiedContent = crypto_1.decryptContent(formSecretKey, verifiedContent);
                    if (!decryptedVerifiedContent) {
                        // Returns null if decrypting verified content failed.
                        throw new Error('Failed to decrypt verified content');
                    }
                    var decryptedVerifiedObject = crypto_1.verifySignedMessage(decryptedVerifiedContent, _this.signingPublicKey);
                    returnedObject.verified = decryptedVerifiedObject;
                }
                return returnedObject;
            }
            catch (err) {
                // Should only throw if MissingPublicKeyError.
                // This library should be able to be used to encrypt and decrypt content
                // if the content does not contain verified fields.
                if (err instanceof errors_1.MissingPublicKeyError) {
                    throw err;
                }
                return null;
            }
        };
        /**
         * Generates a new keypair for encryption.
         * @returns The generated keypair.
         */
        this.generate = crypto_1.generateKeypair;
        /**
         * Returns true if a pair of public & secret keys are associated with each other
         * @param publicKey The public key to verify against.
         * @param secretKey The private key to verify against.
         */
        this.valid = function (publicKey, secretKey) {
            var _a;
            var testResponse = [];
            var internalValidationVersion = 1;
            var cipherResponse = _this.encrypt(testResponse, publicKey);
            // Use toString here since the return should be an empty array.
            return (testResponse.toString() === ((_a = _this.decrypt(secretKey, {
                encryptedContent: cipherResponse,
                version: internalValidationVersion,
            })) === null || _a === void 0 ? void 0 : _a.responses.toString()));
        };
        /**
         * Encrypt given binary file with a unique keypair for each submission.
         * @param binary The file to encrypt, should be a blob that is converted to Uint8Array binary
         * @param formPublicKey The base-64 encoded public key
         * @returns Promise holding the encrypted file
         * @throws error if any of the encrypt methods fail
         */
        this.encryptFile = function (binary, formPublicKey) { return __awaiter(_this, void 0, void 0, function () {
            var submissionKeypair, nonce;
            return __generator(this, function (_a) {
                submissionKeypair = this.generate();
                nonce = tweetnacl_1.default.randomBytes(24);
                return [2 /*return*/, {
                        submissionPublicKey: submissionKeypair.publicKey,
                        nonce: tweetnacl_util_1.encodeBase64(nonce),
                        binary: tweetnacl_1.default.box(binary, nonce, tweetnacl_util_1.decodeBase64(formPublicKey), tweetnacl_util_1.decodeBase64(submissionKeypair.secretKey)),
                    }];
            });
        }); };
        /**
         * Decrypt the given encrypted file content.
         * @param formSecretKey Secret key as a base-64 string
         * @param encrypted Object returned from encryptFile function
         * @param encrypted.submissionPublicKey The submission public key as a base-64 string
         * @param encrypted.nonce The nonce as a base-64 string
         * @param encrypted.blob The encrypted file as a Blob object
         */
        this.decryptFile = function (formSecretKey, _a) {
            var submissionPublicKey = _a.submissionPublicKey, nonce = _a.nonce, encryptedBinary = _a.binary;
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    return [2 /*return*/, tweetnacl_1.default.box.open(encryptedBinary, tweetnacl_util_1.decodeBase64(nonce), tweetnacl_util_1.decodeBase64(submissionPublicKey), tweetnacl_util_1.decodeBase64(formSecretKey))];
                });
            });
        };
        /**
         * Decrypts an encrypted submission, and also download and decrypt any attachments alongside it.
         * @param formSecretKey Secret key as a base-64 string
         * @param decryptParams The params containing encrypted content and information.
         * @returns A promise of the decrypted submission, including attachments (if any). Or else returns null if a decryption error decrypting any part of the submission.
         * @throws {MissingPublicKeyError} if a public key is not provided when instantiating this class and is needed for verifying signed content.
         */
        this.decryptWithAttachments = function (formSecretKey, decryptParams) { return __awaiter(_this, void 0, void 0, function () {
            var decryptedRecords, filenames, attachmentRecords, decryptedContent, fieldIds, downloadPromises, _a;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        decryptedRecords = {};
                        filenames = {};
                        attachmentRecords = (_b = decryptParams.attachmentDownloadUrls) !== null && _b !== void 0 ? _b : {};
                        decryptedContent = this.decrypt(formSecretKey, decryptParams);
                        if (decryptedContent === null)
                            return [2 /*return*/, null
                                // Retrieve all original filenames for attachments for easy lookup
                            ];
                        // Retrieve all original filenames for attachments for easy lookup
                        decryptedContent.responses.forEach(function (response) {
                            if (response.fieldType === 'attachment' && response.answer) {
                                filenames[response._id] = response.answer;
                            }
                        });
                        fieldIds = Object.keys(attachmentRecords);
                        // Check if all fieldIds are within filenames
                        if (!crypto_1.areAttachmentFieldIdsValid(fieldIds, filenames)) {
                            return [2 /*return*/, null];
                        }
                        downloadPromises = fieldIds.map(function (fieldId) {
                            return (axios_1.default
                                // Retrieve all the attachments as JSON
                                .get(attachmentRecords[fieldId], {
                                responseType: 'json',
                            })
                                // Decrypt all the attachments
                                .then(function (_a) {
                                var downloadResponse = _a.data;
                                var encryptedFile = crypto_1.convertEncryptedAttachmentToFileContent(downloadResponse);
                                return _this.decryptFile(formSecretKey, encryptedFile);
                            })
                                .then(function (decryptedFile) {
                                // Check if the file exists and set the filename accordingly; otherwise, throw an error
                                if (decryptedFile) {
                                    decryptedRecords[fieldId] = {
                                        filename: filenames[fieldId],
                                        content: decryptedFile,
                                    };
                                }
                                else {
                                    throw new errors_1.AttachmentDecryptionError();
                                }
                            }));
                        });
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(downloadPromises)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _c.sent();
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/, {
                            content: decryptedContent,
                            attachments: decryptedRecords,
                        }];
                }
            });
        }); };
        this.signingPublicKey = signingPublicKey;
    }
    return Crypto;
}());
exports.default = Crypto;
