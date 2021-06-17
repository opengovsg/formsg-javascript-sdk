import { Keypair, EncryptedAttachmentContent, EncryptedFileContent } from '../types';
/**
 * Helper method to generate a new keypair for encryption.
 * @returns The generated keypair.
 */
export declare const generateKeypair: () => Keypair;
/**
 * Helper function to encrypt input with a unique keypair for each submission.
 * @param msg The message to encrypt
 * @param theirPublicKey The base-64 encoded public key
 * @returns The encrypted basestring
 * @throws error if any of the encrypt methods fail
 */
export declare const encryptMessage: (msg: Uint8Array, theirPublicKey: string) => string;
/**
 * Helper method to decrypt an encrypted submission.
 * @param formPrivateKey base64
 * @param encryptedContent encrypted string encoded in base64
 * @return The decrypted content, or null if decryption failed.
 */
export declare const decryptContent: (formPrivateKey: string, encryptedContent: string) => Uint8Array | null;
/**
 * Helper method to verify a signed message.
 * @param msg the message to verify
 * @param publicKey the public key to authenticate the signed message with
 * @returns the signed message if successful, else an error will be thrown
 * @throws {Error} if the message cannot be verified
 */
export declare const verifySignedMessage: (msg: Uint8Array, publicKey: string) => Record<string, any>;
/**
 * Helper method to check if all the field IDs given are within the filenames
 * @param fieldIds the list of fieldIds to check
 * @param filenames the filenames that should contain the fields
 * @returns boolean indicating whether the fields are valid
 */
export declare const areAttachmentFieldIdsValid: (fieldIds: string[], filenames: Record<string, string>) => boolean;
/**
 * Converts an encrypted attachment to encrypted file content
 * @param encryptedAttachment The encrypted attachment
 * @returns EncryptedFileContent The encrypted file content
 */
export declare const convertEncryptedAttachmentToFileContent: (encryptedAttachment: EncryptedAttachmentContent) => EncryptedFileContent;
