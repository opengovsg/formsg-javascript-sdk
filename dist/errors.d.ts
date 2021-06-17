declare class MissingSecretKeyError extends Error {
    constructor(message?: string);
}
declare class MissingPublicKeyError extends Error {
    constructor(message?: string);
}
declare class WebhookAuthenticateError extends Error {
    constructor(message: string);
}
declare class AttachmentDecryptionError extends Error {
    constructor(message?: string);
}
export { MissingSecretKeyError, MissingPublicKeyError, WebhookAuthenticateError, AttachmentDecryptionError, };
