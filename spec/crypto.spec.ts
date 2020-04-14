import { SIGNING_KEYS } from "../src/resource/signing-keys";
import formsgPackage from "../src/index";
import {
  plaintext,
  ciphertext,
  formSecretKey,
  formPublicKey,
} from "./resources/crypto-data-20200322";

const formsg = formsgPackage({ mode: "test" });
const signingSecretKey = SIGNING_KEYS.test.secretKey;

describe("Crypto", function () {
  it("should generate a keypair", () => {
    const keypair = formsg.crypto.generate();
    expect(Object.keys(keypair)).toContain("secretKey");
    expect(Object.keys(keypair)).toContain("publicKey");
  });

  it("should generate a keypair that is valid", () => {
    const { publicKey, secretKey } = formsg.crypto.generate();
    expect(formsg.crypto.valid(publicKey, secretKey)).toBe(true);
  });

  it("should validate an existing keypair", () => {
    expect(formsg.crypto.valid(formPublicKey, formSecretKey)).toBe(true);
  });

  it("should invalidate unassociated keypairs", () => {
    // Act
    const { secretKey } = formsg.crypto.generate();
    const { publicKey } = formsg.crypto.generate();

    // Assert
    expect(formsg.crypto.valid(publicKey, secretKey)).toBe(false);
  });

  it("should decrypt the submission ciphertext from 2020-03-22 successfully", () => {
    // Act
    const decrypted = formsg.crypto.decrypt(formSecretKey, ciphertext);

    // Assert
    expect(decrypted).toHaveProperty('responses', plaintext)
  });

  it("should return null on unsuccessful decryption", () => {
    expect(formsg.crypto.decrypt("random", ciphertext)).toBe(null);
  });

   it('should return null when successfully decrypted content does not fit FormField type shape', () => {
     // Arrange
     const { publicKey, secretKey } = formsg.crypto.generate();
     const malformedContent =
       'just a string, not an object with FormField shape';
     const malformedEncrypt = formsg.crypto.encrypt(
       publicKey,
       malformedContent,
     );

     // Assert
     // Using correct secret key, but the decrypted object should not fit the
     // expected shape and thus return null.
     expect(formsg.crypto.decrypt(secretKey, malformedEncrypt)).toBe(null);
   });

  it("should be able to encrypt and decrypt submissions from 2020-03-22 end-to-end successfully", () => {
    // Arrange
    const { publicKey, secretKey } = formsg.crypto.generate();

    // Act
    const ciphertext = formsg.crypto.encrypt(publicKey, plaintext);
    const decrypted = formsg.crypto.decrypt(secretKey, ciphertext);
    // Assert
    expect(decrypted).toHaveProperty('responses', plaintext)
  });

  it("should be able to encrypt submissions without signing if signingPrivateKey is missing", () => {
    // Arrange
    const { publicKey, secretKey } = formsg.crypto.generate();

    // Act
    // Signing key (last parameter) is omitted.
    const ciphertext = formsg.crypto.encrypt(publicKey, plaintext);
    const decrypted = formsg.crypto.decrypt(secretKey, ciphertext);

    // Assert
    expect(decrypted).toHaveProperty('responses', plaintext)
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
    expect(decrypted).toHaveProperty('verified', mockVerifiedContent)
    expect(decrypted).toHaveProperty('responses', plaintext)
  });
});
