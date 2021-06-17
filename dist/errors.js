"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var MissingSecretKeyError = /** @class */ (function (_super) {
    __extends(MissingSecretKeyError, _super);
    function MissingSecretKeyError(message) {
        if (message === void 0) { message = 'Provide a secret key when initializing the FormSG SDK to use this function.'; }
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        // Set the prototype explicitly.
        // See https://github.com/facebook/jest/issues/8279
        Object.setPrototypeOf(_this, MissingSecretKeyError.prototype);
        return _this;
    }
    return MissingSecretKeyError;
}(Error));
exports.MissingSecretKeyError = MissingSecretKeyError;
var MissingPublicKeyError = /** @class */ (function (_super) {
    __extends(MissingPublicKeyError, _super);
    function MissingPublicKeyError(message) {
        if (message === void 0) { message = 'Provide a public key when initializing the FormSG SDK to use this function.'; }
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        // Set the prototype explicitly.
        // See https://github.com/facebook/jest/issues/8279
        Object.setPrototypeOf(_this, MissingPublicKeyError.prototype);
        return _this;
    }
    return MissingPublicKeyError;
}(Error));
exports.MissingPublicKeyError = MissingPublicKeyError;
var WebhookAuthenticateError = /** @class */ (function (_super) {
    __extends(WebhookAuthenticateError, _super);
    function WebhookAuthenticateError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        // Set the prototype explicitly.
        // See https://github.com/facebook/jest/issues/8279
        Object.setPrototypeOf(_this, WebhookAuthenticateError.prototype);
        return _this;
    }
    return WebhookAuthenticateError;
}(Error));
exports.WebhookAuthenticateError = WebhookAuthenticateError;
var AttachmentDecryptionError = /** @class */ (function (_super) {
    __extends(AttachmentDecryptionError, _super);
    function AttachmentDecryptionError(message) {
        if (message === void 0) { message = 'Attachment decryption with the given nonce failed.'; }
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        return _this;
    }
    return AttachmentDecryptionError;
}(Error));
exports.AttachmentDecryptionError = AttachmentDecryptionError;
