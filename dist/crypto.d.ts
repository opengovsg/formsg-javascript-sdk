import { DecryptedContent, DecryptedContentAndAttachments, DecryptParams, EncryptedFileContent } from './types';
export default class Crypto {
    signingPublicKey?: string;
    constructor({ signingPublicKey }?: {
        signingPublicKey?: string;
    });
    /**
     * Encrypt input with a unique keypair for each submission
     * @param encryptionPublicKey The base-64 encoded public key for encrypting.
     * @param msg The message to encrypt, will be stringified.
     * @param signingPrivateKey Optional. Must be a base-64 encoded private key. If given, will be used to signing the given msg param prior to encrypting.
     * @returns The encrypted basestring.
     */
    encrypt: (msg: any, encryptionPublicKey: string, signingPrivateKey?: string | undefined) => string;
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
    decrypt: (formSecretKey: string, decryptParams: DecryptParams) => DecryptedContent | null;
    /**
     * Generates a new keypair for encryption.
     * @returns The generated keypair.
     */
    generate: () => import("./types").Keypair;
    /**
     * Returns true if a pair of public & secret keys are associated with each other
     * @param publicKey The public key to verify against.
     * @param secretKey The private key to verify against.
     */
    valid: (publicKey: string, secretKey: string) => boolean;
    /**
     * Encrypt given binary file with a unique keypair for each submission.
     * @param binary The file to encrypt, should be a blob that is converted to Uint8Array binary
     * @param formPublicKey The base-64 encoded public key
     * @returns Promise holding the encrypted file
     * @throws error if any of the encrypt methods fail
     */
    encryptFile: (binary: Uint8Array, formPublicKey: string) => Promise<EncryptedFileContent>;
    /**
     * Decrypt the given encrypted file content.
     * @param formSecretKey Secret key as a base-64 string
     * @param encrypted Object returned from encryptFile function
     * @param encrypted.submissionPublicKey The submission public key as a base-64 string
     * @param encrypted.nonce The nonce as a base-64 string
     * @param encrypted.blob The encrypted file as a Blob object
     */
    decryptFile: (formSecretKey: string, { submissionPublicKey, nonce, binary: encryptedBinary, }: EncryptedFileContent) => Promise<Uint8Array | null>;
    /**
     * Decrypts an encrypted submission, and also download and decrypt any attachments alongside it.
     * @param formSecretKey Secret key as a base-64 string
     * @param decryptParams The params containing encrypted content and information.
     * @returns A promise of the decrypted submission, including attachments (if any). Or else returns null if a decryption error decrypting any part of the submission.
     * @throws {MissingPublicKeyError} if a public key is not provided when instantiating this class and is needed for verifying signed content.
     */
    decryptWithAttachments: (formSecretKey: string, decryptParams: DecryptParams) => Promise<DecryptedContentAndAttachments | null>;
}
