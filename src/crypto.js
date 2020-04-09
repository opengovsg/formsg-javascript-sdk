"use strict";

const { getPublicKey } = require("./util/publicKey");

const nacl = require("tweetnacl");
const {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} = require("tweetnacl-util");

/**
 * A field type available in FormSG as a string
 * @typedef {string} FieldType
 * @example
 * 'section'
 * 'radiobutton'
 * 'dropdown'
 * 'checkbox'
 * 'nric'
 * 'email'
 * 'table'
 * 'number'
 * 'rating'
 * 'yes_no'
 * 'decimal'
 * 'textfield' // Short Text
 * 'textarea' // Long Text
 * 'attachment'
 * 'date'
 * 'mobile'
 */

/**
 * Represents an answer provided to a form question.
 * @typedef {object} Response
 * @property {string} _id - The field ID of the response
 * @property {string} question - The form question
 * @property {string} answer - The answer to the form
 * @property {FieldType} fieldType - The field type
 */

/**
 * Encrypted basestring containing the submission public key,
 * nonce and encrypted data in base-64.
 * @typedef {string} EncryptedContent
 * A string in the format of <SubmissionPublicKey>;<Base64Nonce>:<Base64EncryptedData>
 */

/**
 *
 * @param {string} encryptionPublicKey The base-64 encoded public key for encrypting.
 * @param {any} msg The message to encrypt, will be stringified.
 * @param {string} signingPrivateKey The base-64 encoded private key for signing.
 */
function encrypt(encryptionPublicKey, msg, signingPrivateKey = null) {
  let processedMsg = decodeUTF8(JSON.stringify(msg));

  if (signingPrivateKey) {
    processedMsg = nacl.sign(processedMsg, decodeBase64(signingPrivateKey));
  }

  return _encrypt(processedMsg, encryptionPublicKey);
}

/**
 * Helper function to encrypt input with a unique keypair for each submission.
 * @param {Uint8Array} msg The message to encrypt
 * @param {string} theirPublicKey The base-64 encoded public key
 * @returns {EncryptedContent}
 * @throws error if any of the encrypt methods fail
 */
function _encrypt(msg, theirPublicKey) {
  const submissionKeypair = generate();
  const nonce = nacl.randomBytes(24);
  const encrypted = encodeBase64(
    nacl.box(
      msg,
      nonce,
      decodeBase64(theirPublicKey),
      decodeBase64(submissionKeypair.secretKey)
    )
  );
  return `${submissionKeypair.publicKey};${encodeBase64(nonce)}:${encrypted}`;
}

/**
 * Helper method to decrypt an encrypted submission.
 * @param {string} formPrivateKey base64
 * @param {EncryptedContent} encryptedContent encrypted string encoded in base64
 * @return {Uint8Array | null} The decrypted content.
 */
function _decrypt(formPrivateKey, encryptedContent) {
  try {
    const [submissionPublicKey, nonceEncrypted] = encryptedContent.split(";");
    const [nonce, encrypted] = nonceEncrypted.split(":").map(decodeBase64);
    return nacl.box.open(
      encrypted,
      nonce,
      decodeBase64(submissionPublicKey),
      decodeBase64(formPrivateKey)
    );
  } catch (err) {
    return null;
  }
}

/**
 *
 * @param {Uint8Array} msg The message to verify
 * @param {string} publicKey
 */
function _verifySignedMessage(msg, publicKey) {
  return JSON.parse(encodeUTF8(nacl.sign.open(msg, decodeBase64(publicKey))));
}

/**
 * Method to decrypt an encrypted submission.
 * @param {string} formSecretKey base64
 * @param {EncryptedContent} encryptedContent encrypted string encoded in base64
 * @param {EncryptedContent?} verifiedContent (optional) encrypted and signed string encoded in base64.
 * @return {Object | null} Parsed JSON submission object if successful.
 */
const decrypt = (signingPublicKey) => (
  formSecretKey,
  encryptedContent,
  verifiedContent
) => {
  try {
    // Do not return the transformed object in `_decrypt` function as a signed
    // object is not encoded in UTF8 and is encoded in Base-64 instead.
    let decryptedContent = _decrypt(formSecretKey, encryptedContent);
    decryptedContent = JSON.parse(encodeUTF8(decryptedContent));

    if (verifiedContent) {
      // Decrypted message must be able to be authenticated by the public key.
      let decryptedVerifiedContent = _decrypt(formSecretKey, verifiedContent);
      if (!decryptedVerifiedContent) {
        // Returns null if verification for decrypt failed.
        throw new Error('Verification failed for signature');
      }
      decryptedVerifiedContent = _verifySignedMessage(
        decryptedVerifiedContent,
        signingPublicKey
      );

      decryptedContent.push(decryptedVerifiedContent);
    }

    return decryptedContent;
  } catch (err) {
    return null;
  }
};

/**
 * A base-64 encoded cryptographic keypair suitable for curve25519.
 * @typedef {Object} Keypair
 * @property {string} publicKey The base-64 encoded public key
 * @property {string} secretKey The base-64 encoded secret key
 */

/**
 * Generates a new keypair for encryption.
 * @returns {Keypair}
 */
function generate() {
  const kp = nacl.box.keyPair();
  return {
    publicKey: encodeBase64(kp.publicKey),
    secretKey: encodeBase64(kp.secretKey),
  };
}

/**
 * Returns true if a pair of public & secret keys are associated with each other
 * @param {string} publicKey
 * @param {string} secretKey
 */
const valid = (signingPublicKey) => (publicKey, secretKey) => {
  const plaintext = "testtext";
  try {
    const ciphertext = encrypt(publicKey, plaintext);
    return decrypt(signingPublicKey)(secretKey, ciphertext) === plaintext;
  } catch (err) {
    return false;
  }
};

/**
 * Provider that accepts configuration
 * before returning the crypto module
 */
module.exports = function ({ mode }) {
  const signingPublicKey = getPublicKey(mode);
  return {
    encrypt,
    decrypt: decrypt(signingPublicKey),
    generate,
    valid: valid(signingPublicKey),
  };
};
