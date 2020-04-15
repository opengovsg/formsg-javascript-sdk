"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var nacl = __importStar(require("tweetnacl"));
var tweetnacl_util_1 = require("tweetnacl-util");
var publicKey_1 = require("./util/publicKey");
var guard_1 = require("./util/guard");
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
        processedMsg = nacl.sign(processedMsg, tweetnacl_util_1.decodeBase64(signingPrivateKey));
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
    var nonce = nacl.randomBytes(24);
    var encrypted = tweetnacl_util_1.encodeBase64(nacl.box(msg, nonce, tweetnacl_util_1.decodeBase64(theirPublicKey), tweetnacl_util_1.decodeBase64(submissionKeypair.secretKey)));
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
        return nacl.box.open(encrypted, nonce, tweetnacl_util_1.decodeBase64(submissionPublicKey), tweetnacl_util_1.decodeBase64(formPrivateKey));
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
    var openedMessage = nacl.sign.open(msg, tweetnacl_util_1.decodeBase64(publicKey));
    if (!openedMessage)
        throw new Error('Failed to open signed message with given public key');
    return JSON.parse(tweetnacl_util_1.encodeUTF8(openedMessage));
}
/**
 * Method to decrypt an encrypted submission.
 * @param signingPublicKey The public key to open verified objects that was signed with the private key passed to this library.
 */
function decrypt(signingPublicKey) {
    /**
     * The real method to decrypt an encrypted submission.
     * @param formSecretKey The base-64 secret key of the form to decrypt with.
     * @param encryptedContent The encrypted content encoded with base-64.
     * @param verifiedContent Optional. The encrypted and signed verified content. If given, the signingPublicKey will be used to attempt to open the signed message.
     * @returns The decrypted content if successful. Else, null will be returned.
     */
    function internalDecrypt(formSecretKey, encryptedContent, verifiedContent) {
        try {
            // Do not return the transformed object in `_decrypt` function as a signed
            // object is not encoded in UTF8 and is encoded in Base-64 instead.
            var decryptedContent = _decrypt(formSecretKey, encryptedContent);
            if (!decryptedContent) {
                throw new Error('Failed to decrypt content');
            }
            var decryptedObject = JSON.parse(tweetnacl_util_1.encodeUTF8(decryptedContent));
            if (!guard_1.determineIsFormFields(decryptedObject)) {
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
    return internalDecrypt;
}
/**
 * Generates a new keypair for encryption.
 * @returns The generated keypair.
 */
function generate() {
    var kp = nacl.box.keyPair();
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
module.exports = function (_a) {
    var mode = _a.mode;
    var signingPublicKey = publicKey_1.getPublicKey(mode);
    return {
        encrypt: encrypt,
        decrypt: decrypt(signingPublicKey),
        generate: generate,
        valid: valid(signingPublicKey),
    };
};
