"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var tweetnacl = __importStar(require("tweetnacl"));
var tweetnacl_util_1 = require("tweetnacl-util");
/**
 * Returns a signature from a basestring and secret key
 * @param basestring The data you want to sign.
 * @param secretKey 64-byte secret key in base64 encoding.
 * @return base64 encoded signature
 */
function sign(basestring, secretKey) {
    return tweetnacl_util_1.encodeBase64(tweetnacl.sign.detached(tweetnacl_util_1.decodeUTF8(basestring), tweetnacl_util_1.decodeBase64(secretKey)));
}
exports.sign = sign;
/**
 * Verifies a signature against a message and public key
 * @param message The message to verify
 * @param signature The base64 encoded signature generated from sign()
 * @param publicKey 32-byte public key in base64 encoding
 * @return True if verification checks out, false otherwise
 */
function verify(message, signature, publicKey) {
    return tweetnacl.sign.detached.verify(tweetnacl_util_1.decodeUTF8(message), tweetnacl_util_1.decodeBase64(signature), tweetnacl_util_1.decodeBase64(publicKey));
}
exports.verify = verify;
