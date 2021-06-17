"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var publicKey_1 = require("./util/publicKey");
var crypto_1 = __importDefault(require("./crypto"));
var verification_1 = __importDefault(require("./verification"));
var webhooks_1 = __importDefault(require("./webhooks"));
module.exports = function (config) {
    if (config === void 0) { config = {}; }
    var webhookSecretKey = config.webhookSecretKey, mode = config.mode, verificationOptions = config.verificationOptions;
    /**
     * Public key is used for decrypting signed verified content in the `crypto` module, and
     * also for verifying webhook signatures' authenticity in the `wehbooks` module.
     */
    var signingPublicKey = publicKey_1.getSigningPublicKey(mode || 'production');
    /**
     * Public key is used for verifying verified field signatures' authenticity in the `verification` module.
     */
    var verificationPublicKey = publicKey_1.getVerificationPublicKey(mode || 'production');
    return {
        webhooks: new webhooks_1.default({
            publicKey: signingPublicKey,
            secretKey: webhookSecretKey,
        }),
        crypto: new crypto_1.default({ signingPublicKey: signingPublicKey }),
        verification: new verification_1.default({
            publicKey: verificationPublicKey,
            secretKey: verificationOptions === null || verificationOptions === void 0 ? void 0 : verificationOptions.secretKey,
            transactionExpiry: verificationOptions === null || verificationOptions === void 0 ? void 0 : verificationOptions.transactionExpiry,
        }),
    };
};
