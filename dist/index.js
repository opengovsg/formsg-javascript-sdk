"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var webhooks_1 = __importDefault(require("./webhooks"));
var crypto_1 = __importDefault(require("./crypto"));
module.exports = function (options) {
    if (options === void 0) { options = {}; }
    var mode = options.mode, webhookSecretKey = options.webhookSecretKey;
    return {
        webhooks: webhooks_1.default({
            mode: mode || 'production',
            webhookSecretKey: webhookSecretKey,
        }),
        crypto: crypto_1.default({
            mode: mode || 'production',
        }),
    };
};
