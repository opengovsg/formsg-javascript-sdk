"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var tweetnacl_1 = __importDefault(require("tweetnacl"));
var tweetnacl_util_1 = require("tweetnacl-util");
/**
 * Helper method to generate a new keypair for encryption.
 * @returns The generated keypair.
 */
exports.generateKeypair = function () {
    var kp = tweetnacl_1.default.box.keyPair();
    return {
        publicKey: tweetnacl_util_1.encodeBase64(kp.publicKey),
        secretKey: tweetnacl_util_1.encodeBase64(kp.secretKey),
    };
};
/**
 * Helper function to encrypt input with a unique keypair for each submission.
 * @param msg The message to encrypt
 * @param theirPublicKey The base-64 encoded public key
 * @returns The encrypted basestring
 * @throws error if any of the encrypt methods fail
 */
exports.encryptMessage = function (msg, theirPublicKey) {
    var submissionKeypair = exports.generateKeypair();
    var nonce = tweetnacl_1.default.randomBytes(24);
    var encrypted = tweetnacl_util_1.encodeBase64(tweetnacl_1.default.box(msg, nonce, tweetnacl_util_1.decodeBase64(theirPublicKey), tweetnacl_util_1.decodeBase64(submissionKeypair.secretKey)));
    return submissionKeypair.publicKey + ";" + tweetnacl_util_1.encodeBase64(nonce) + ":" + encrypted;
};
/**
 * Helper method to decrypt an encrypted submission.
 * @param formPrivateKey base64
 * @param encryptedContent encrypted string encoded in base64
 * @return The decrypted content, or null if decryption failed.
 */
exports.decryptContent = function (formPrivateKey, encryptedContent) {
    try {
        var _a = encryptedContent.split(';'), submissionPublicKey = _a[0], nonceEncrypted = _a[1];
        var _b = nonceEncrypted.split(':').map(tweetnacl_util_1.decodeBase64), nonce = _b[0], encrypted = _b[1];
        return tweetnacl_1.default.box.open(encrypted, nonce, tweetnacl_util_1.decodeBase64(submissionPublicKey), tweetnacl_util_1.decodeBase64(formPrivateKey));
    }
    catch (err) {
        return null;
    }
};
/**
 * Helper method to verify a signed message.
 * @param msg the message to verify
 * @param publicKey the public key to authenticate the signed message with
 * @returns the signed message if successful, else an error will be thrown
 * @throws {Error} if the message cannot be verified
 */
exports.verifySignedMessage = function (msg, publicKey) {
    var openedMessage = tweetnacl_1.default.sign.open(msg, tweetnacl_util_1.decodeBase64(publicKey));
    if (!openedMessage)
        throw new Error('Failed to open signed message with given public key');
    return JSON.parse(tweetnacl_util_1.encodeUTF8(openedMessage));
};
/**
 * Helper method to check if all the field IDs given are within the filenames
 * @param fieldIds the list of fieldIds to check
 * @param filenames the filenames that should contain the fields
 * @returns boolean indicating whether the fields are valid
 */
exports.areAttachmentFieldIdsValid = function (fieldIds, filenames) {
    return fieldIds.every(function (fieldId) { return filenames[fieldId]; });
};
/**
 * Converts an encrypted attachment to encrypted file content
 * @param encryptedAttachment The encrypted attachment
 * @returns EncryptedFileContent The encrypted file content
 */
exports.convertEncryptedAttachmentToFileContent = function (encryptedAttachment) { return ({
    submissionPublicKey: encryptedAttachment.encryptedFile.submissionPublicKey,
    nonce: encryptedAttachment.encryptedFile.nonce,
    binary: tweetnacl_util_1.decodeBase64(encryptedAttachment.encryptedFile.binary),
}); };
