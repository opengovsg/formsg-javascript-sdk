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
var Blob = require('blob-polyfill').Blob;
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var tweetnacl_util_1 = require("tweetnacl-util");
var publicKey_1 = require("./util/publicKey");
var validate_1 = require("./util/validate");
/**
 * Encrypt input with a unique keypair for each submission
 * @param encryptionPublicKey The base-64 encoded public key for encrypting.
 * @param msg The message to encrypt, will be stringified.
 * @param signingPrivateKey Optional. Must be a base-64 encoded private key,  will be used to signing the given msg param prior to encrypting.
 * @returns The encrypted basestring.
 */
function encrypt(msg, encryptionPublicKey, signingPrivateKey) {
    var processedMsg = tweetnacl_util_1.decodeUTF8(JSON.stringify(msg));
    if (signingPrivateKey) {
        processedMsg = tweetnacl_1.default.sign(processedMsg, tweetnacl_util_1.decodeBase64(signingPrivateKey));
    }
    return _encrypt(processedMsg, encryptionPublicKey);
}
/**
 * Helper function to encrypt input with a unique keypair for each submission.
 * @param msg The message to encrypt
 * @param theirPublicKey The base-64 encoded public key
 * @returns The encrypted basestring
 * @throws error if any of the encrypt methods fail
 */
function _encrypt(msg, theirPublicKey) {
    var submissionKeypair = generate();
    var nonce = tweetnacl_1.default.randomBytes(24);
    var encrypted = tweetnacl_util_1.encodeBase64(tweetnacl_1.default.box(msg, nonce, tweetnacl_util_1.decodeBase64(theirPublicKey), tweetnacl_util_1.decodeBase64(submissionKeypair.secretKey)));
    return submissionKeypair.publicKey + ";" + tweetnacl_util_1.encodeBase64(nonce) + ":" + encrypted;
}
/**
 * Helper method to decrypt an encrypted submission.
 * @param formPrivateKey base64
 * @param encryptedContent encrypted string encoded in base64
 * @return The decrypted content, or null if decryption failed.
 */
function _decrypt(formPrivateKey, encryptedContent) {
    try {
        var _a = encryptedContent.split(';'), submissionPublicKey = _a[0], nonceEncrypted = _a[1];
        var _b = nonceEncrypted.split(':').map(tweetnacl_util_1.decodeBase64), nonce = _b[0], encrypted = _b[1];
        return tweetnacl_1.default.box.open(encrypted, nonce, tweetnacl_util_1.decodeBase64(submissionPublicKey), tweetnacl_util_1.decodeBase64(formPrivateKey));
    }
    catch (err) {
        return null;
    }
}
/**
 * Helper method to verify a signed message.
 * @param msg the message to verify
 * @param publicKey the public key to authenticate the signed message with
 * @returns the signed message if successful, else an error will be thrown.
 */
function _verifySignedMessage(msg, publicKey) {
    var openedMessage = tweetnacl_1.default.sign.open(msg, tweetnacl_util_1.decodeBase64(publicKey));
    if (!openedMessage)
        throw new Error('Failed to open signed message with given public key');
    return JSON.parse(tweetnacl_util_1.encodeUTF8(openedMessage));
}
/**
 * Higher order function returning a function to decrypt an encrypted
 * submission.
 * @param signingPublicKey The public key to open verified objects that was signed with the private key passed to this library.
 */
function decrypt(signingPublicKey) {
    /**
     * Decrypts an encrypted submission and returns it.
     * @param formSecretKey The base-64 secret key of the form to decrypt with.
     * @param encryptedContent The encrypted content encoded with base-64.
     * @param verifiedContent Optional. The encrypted and signed verified content. If given, the signingPublicKey will be used to attempt to open the signed message.
     * @returns The decrypted content if successful. Else, null will be returned.
     */
    function _internalDecrypt(formSecretKey, encryptedContent, verifiedContent) {
        try {
            // Do not return the transformed object in `_decrypt` function as a signed
            // object is not encoded in UTF8 and is encoded in Base-64 instead.
            var decryptedContent = _decrypt(formSecretKey, encryptedContent);
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
                // Only care if it is the correct shape if verifiedContent exists, since
                // we need to append it to the end.
                // Decrypted message must be able to be authenticated by the public key.
                var decryptedVerifiedContent = _decrypt(formSecretKey, verifiedContent);
                if (!decryptedVerifiedContent) {
                    // Returns null if verification for decrypt failed.
                    throw new Error('Verification failed for signature');
                }
                var decryptedVerifiedObject = _verifySignedMessage(decryptedVerifiedContent, signingPublicKey);
                returnedObject.verified = decryptedVerifiedObject;
            }
            return returnedObject;
        }
        catch (err) {
            return null;
        }
    }
    return _internalDecrypt;
}
/**
 * Generates a new keypair for encryption.
 * @returns The generated keypair.
 */
function generate() {
    var kp = tweetnacl_1.default.box.keyPair();
    return {
        publicKey: tweetnacl_util_1.encodeBase64(kp.publicKey),
        secretKey: tweetnacl_util_1.encodeBase64(kp.secretKey),
    };
}
function valid(signingPublicKey) {
    /**
     * Returns true if a pair of public & secret keys are associated with each other
     * @param publicKey The public key to verify against.
     * @param secretKey The private key to verify against.
     */
    function _internalValid(publicKey, secretKey) {
        var _a;
        var testResponse = [];
        try {
            var cipherResponse = encrypt(testResponse, publicKey);
            // Use toString here since the return should be an empty array.
            return (testResponse.toString() === ((_a = decrypt(signingPublicKey)(secretKey, cipherResponse)) === null || _a === void 0 ? void 0 : _a.responses.toString()));
        }
        catch (err) {
            return false;
        }
    }
    return _internalValid;
}
/**
 * Helper function to encrypt file with a unique keypair for each submission.
 * @param blob The file to encrypt
 * @param formPublicKey The base-64 encoded public key
 * @returns Promise holding the encrypted file
 * @throws error if any of the encrypt methods fail
 */
function encryptFile(blob, formPublicKey) {
    return __awaiter(this, void 0, void 0, function () {
        var binary, _a, submissionKeypair, nonce;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = Uint8Array.bind;
                    return [4 /*yield*/, blob.arrayBuffer()];
                case 1:
                    binary = new (_a.apply(Uint8Array, [void 0, _b.sent()]))();
                    submissionKeypair = generate();
                    nonce = tweetnacl_1.default.randomBytes(24);
                    return [2 /*return*/, {
                            submissionPublicKey: submissionKeypair.publicKey,
                            nonce: tweetnacl_util_1.encodeBase64(nonce),
                            blob: new Blob([tweetnacl_1.default.box(binary, nonce, tweetnacl_util_1.decodeBase64(formPublicKey), tweetnacl_util_1.decodeBase64(submissionKeypair.secretKey))])
                        }];
            }
        });
    });
}
/**
 * Helper function to decrypt a file
 * @param formSecretKey Secret key as a base-64 string
 * @param encrypted Object returned from encryptFile function
 * @param encrypted.submissionPublicKey The submission public key as a base-64 string
 * @param encrypted.nonce The nonce as a base-64 string
 * @param encrypted.blob The encrypted file as a Blob object
 */
function decryptFile(formSecretKey, _a) {
    var submissionPublicKey = _a.submissionPublicKey, nonce = _a.nonce, blob = _a.blob;
    return __awaiter(this, void 0, void 0, function () {
        var encryptedBinary, _b, decryptedBinary;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = Uint8Array.bind;
                    return [4 /*yield*/, blob.arrayBuffer()];
                case 1:
                    encryptedBinary = new (_b.apply(Uint8Array, [void 0, _c.sent()]))();
                    decryptedBinary = tweetnacl_1.default.box.open(encryptedBinary, tweetnacl_util_1.decodeBase64(nonce), tweetnacl_util_1.decodeBase64(submissionPublicKey), tweetnacl_util_1.decodeBase64(formSecretKey));
                    if (decryptedBinary)
                        return [2 /*return*/, new Blob([decryptedBinary])];
                    else
                        return [2 /*return*/, null];
                    return [2 /*return*/];
            }
        });
    });
}
module.exports = function (_a) {
    var mode = _a.mode;
    var signingPublicKey = publicKey_1.getPublicKey(mode);
    return {
        encrypt: encrypt,
        decrypt: decrypt(signingPublicKey),
        generate: generate,
        valid: valid(signingPublicKey),
        encryptFile: encryptFile,
        decryptFile: decryptFile,
    };
};
