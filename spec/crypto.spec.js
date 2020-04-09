const _ = require('lodash')

const {
  secretKey: signingSecretKey,
} = require('../resource/signing-keys').test;

const formsg = require('../src/index')({ mode: 'test' })

const {
  plaintext,
  ciphertext,
  formSecretKey,
  formPublicKey,
} = require('./resources/crypto-data-20200322')

describe('Crypto', function () {

  it('should generate a keypair', () => {
    const keypair = formsg.crypto.generate()
    expect(Object.keys(keypair)).toContain('secretKey')
    expect(Object.keys(keypair)).toContain('publicKey')
  })

  it('should generate a keypair that is valid', () => {
    const { publicKey, secretKey } = formsg.crypto.generate()
    expect(formsg.crypto.valid(publicKey, secretKey)).toBe(true)
  })

  it('should validate an existing keypair', () => {
    expect(formsg.crypto.valid(formPublicKey, formSecretKey)).toBe(true)
  })

  it('should invalidate unassociated keypairs', () => {
    const { secretKey } = formsg.crypto.generate()
    const { publicKey } = formsg.crypto.generate()
    expect(formsg.crypto.valid(
      publicKey,
      secretKey,
    )).toBe(false)
  })

  it('should decrypt the submission ciphertext from 2020-03-22 successfully', () => {
    const decryptedPlaintext = formsg.crypto.decrypt(formSecretKey, ciphertext)
    expect(_.isEqual(decryptedPlaintext, plaintext)).toBe(true)
  })

  it('should return null on unsuccessful decryption', () => {
    expect(formsg.crypto.decrypt('random', ciphertext)).toBe(null)
  })

  it('should be able to encrypt and decrypt submissions from 2020-03-22 end-to-end successfully', () => {
    const { publicKey, secretKey } = formsg.crypto.generate()
    const ciphertext = formsg.crypto.encrypt(publicKey, plaintext)
    const decrypted = formsg.crypto.decrypt(secretKey, ciphertext)
    expect(_.isEqual(decrypted, plaintext)).toBe(true)
  })

  it("should be able to encrypt submissions without signing if signingPrivateKey is missing", () => {
    const { publicKey, secretKey } = formsg.crypto.generate();
    // Signing key (last parameter) is omitted.
    const ciphertext = formsg.crypto.encrypt(publicKey, plaintext);
    const decrypted = formsg.crypto.decrypt(secretKey, ciphertext);

    expect(_.isEqual(decrypted, plaintext)).toBe(true);
  });

  it("should be able to encrypt and sign submissions if signingPrivateKey is given", () => {
    // Arrange
    const { publicKey, secretKey } = formsg.crypto.generate();
    const mockVerifiedContent = {
      question: "SingPass Validated NRIC",
      fieldType: "authentication",
      isVisible: true,
      answer: "S12345679Z",
    };

    // Act
    // Encrypt content that is not signed.
    const ciphertext = formsg.crypto.encrypt(publicKey, plaintext);
    // Sign and encrypt the desired content.
    const signedAndEncryptedText = formsg.crypto.encrypt(
      publicKey,
      mockVerifiedContent,
      signingSecretKey
    );
    // Decrypt encrypted content along with our signed+encrypted content.
    const decrypted = formsg.crypto.decrypt(
      secretKey,
      ciphertext,
      signedAndEncryptedText
    );

    // Assert
    // The last object in the decrypted array should be the initial verified
    // content.
    expect(_.isEqual(_.last(decrypted), mockVerifiedContent)).toBe(true);
    // The rest of the decrypted array should be the initial plaintext.
    expect(_.isEqual(_.initial(decrypted), plaintext)).toBe(true);
  });
})
