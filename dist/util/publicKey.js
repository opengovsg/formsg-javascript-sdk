"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var signing_keys_1 = require("../resource/signing-keys");
var stage_1 = __importDefault(require("./stage"));
/**
 * Retrieves the appropriate public key.
 * Defaults to production.
 * @param mode The package mode to retrieve the public key for.
 */
function getPublicKey(mode) {
    switch (mode) {
        case stage_1.default.development:
        case stage_1.default.staging:
            return signing_keys_1.SIGNING_KEYS.staging.publicKey;
        case stage_1.default.test:
            return signing_keys_1.SIGNING_KEYS.test.publicKey;
        default:
            return signing_keys_1.SIGNING_KEYS.production.publicKey;
    }
}
exports.getPublicKey = getPublicKey;
