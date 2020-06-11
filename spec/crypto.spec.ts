import Crypto from '../src/crypto'
import { SIGNING_KEYS } from '../src/resource/signing-keys'

import {
  plaintext,
  ciphertext,
  formSecretKey,
  formPublicKey,
} from './resources/crypto-data-20200322'
import { plaintextMultiLang } from './resources/crypto-data-20200604'
import { MissingPublicKeyError } from '../src/errors'

const INTERNAL_TEST_VERSION = 1

const encryptionPublicKey = SIGNING_KEYS.test.publicKey
const signingSecretKey = SIGNING_KEYS.test.secretKey
const testFileBuffer = new Uint8Array(Buffer.from('./resources/ogp.svg'))

describe('Crypto', function () {
  const crypto = new Crypto({ publicSigningKey: encryptionPublicKey })

  const mockVerifiedContent = {
    uinFin: 'S12345679Z',
    somethingElse: 99,
  }

  it('should generate a keypair', () => {
    const keypair = crypto.generate()
    expect(keypair).toHaveProperty('secretKey')
    expect(keypair).toHaveProperty('publicKey')
  })

  it('should generate a keypair that is valid', () => {
    const { publicKey, secretKey } = crypto.generate()
    expect(crypto.valid(publicKey, secretKey)).toBe(true)
  })

  it('should validate an existing keypair', () => {
    expect(crypto.valid(formPublicKey, formSecretKey)).toBe(true)
  })

  it('should invalidate unassociated keypairs', () => {
    // Act
    const { secretKey } = crypto.generate()
    const { publicKey } = crypto.generate()

    // Assert
    expect(crypto.valid(publicKey, secretKey)).toBe(false)
  })

  it('should decrypt the submission ciphertext from 2020-03-22 successfully', () => {
    // Act
    const decrypted = crypto.decrypt(formSecretKey, {
      encryptedContent: ciphertext,
      version: INTERNAL_TEST_VERSION,
    })

    // Assert
    expect(decrypted).toHaveProperty('responses', plaintext)
  })

  it('should return null on unsuccessful decryption', () => {
    expect(
      crypto.decrypt('random', {
        encryptedContent: ciphertext,
        version: INTERNAL_TEST_VERSION,
      })
    ).toBe(null)
  })

  it('should return null when successfully decrypted content does not fit FormField type shape', () => {
    // Arrange
    const { publicKey, secretKey } = crypto.generate()
    const malformedContent = 'just a string, not an object with FormField shape'
    const malformedEncrypt = crypto.encrypt(malformedContent, publicKey)

    // Assert
    // Using correct secret key, but the decrypted object should not fit the
    // expected shape and thus return null.
    expect(
      crypto.decrypt(secretKey, {
        encryptedContent: malformedEncrypt,
        version: INTERNAL_TEST_VERSION,
      })
    ).toBe(null)
  })

  it('should be able to encrypt and decrypt submissions from 2020-03-22 end-to-end successfully', () => {
    // Arrange
    const { publicKey, secretKey } = crypto.generate()

    // Act
    const ciphertext = crypto.encrypt(plaintext, publicKey)
    const decrypted = crypto.decrypt(secretKey, {
      encryptedContent: ciphertext,
      version: INTERNAL_TEST_VERSION,
    })
    // Assert
    expect(decrypted).toHaveProperty('responses', plaintext)
  })

  it('should be able to encrypt and decrypt multi-language submission from 2020-06-04 end-to-end successfully', () => {
    // Arrange
    const { publicKey, secretKey } = crypto.generate()

    // Act
    const ciphertext = crypto.encrypt(plaintextMultiLang, publicKey)
    const decrypted = crypto.decrypt(secretKey, {
      encryptedContent: ciphertext,
      version: INTERNAL_TEST_VERSION,
    })
    // Assert
    expect(decrypted).toHaveProperty('responses', plaintextMultiLang)
  })

  it('should be able to encrypt submissions without signing if signingPrivateKey is missing', () => {
    // Arrange
    const { publicKey, secretKey } = crypto.generate()

    // Act
    // Signing key (last parameter) is omitted.
    const ciphertext = crypto.encrypt(plaintext, publicKey)
    const decrypted = crypto.decrypt(secretKey, {
      encryptedContent: ciphertext,
      version: INTERNAL_TEST_VERSION,
    })

    // Assert
    expect(decrypted).toHaveProperty('responses', plaintext)
  })

  it('should be able to encrypt and sign submissions if signingPrivateKey is given', () => {
    // Arrange
    const { publicKey, secretKey } = crypto.generate()

    // Act
    // Encrypt content that is not signed.
    const ciphertext = crypto.encrypt(plaintext, publicKey)
    // Sign and encrypt the desired content.
    const signedAndEncryptedText = crypto.encrypt(
      mockVerifiedContent,
      publicKey,
      signingSecretKey
    )
    // Decrypt encrypted content along with our signed+encrypted content.
    const decrypted = crypto.decrypt(secretKey, {
      encryptedContent: ciphertext,
      verifiedContent: signedAndEncryptedText,
      version: INTERNAL_TEST_VERSION,
    })

    // Assert
    expect(decrypted).toHaveProperty('verified', mockVerifiedContent)
    expect(decrypted).toHaveProperty('responses', plaintext)
  })

  it('should be able to encrypt and decrypt files end-to-end', async () => {
    // Arrange
    const { publicKey, secretKey } = crypto.generate()

    // Act
    // Encrypt
    const encrypted = await crypto.encryptFile(testFileBuffer, publicKey)
    expect(encrypted).toHaveProperty('submissionPublicKey')
    expect(encrypted).toHaveProperty('nonce')
    expect(encrypted).toHaveProperty('binary')

    // Decrypt
    const decrypted = await crypto.decryptFile(secretKey, encrypted)

    if (!decrypted) {
      throw new Error('File should be able to decrypt successfully.')
    }

    // Compare
    expect(testFileBuffer).toEqual(decrypted)
  })

  it('should return null if file could not be decrypted', async () => {
    const { publicKey, secretKey } = crypto.generate()

    const encrypted = await crypto.encryptFile(testFileBuffer, publicKey)
    // Rewrite binary with invalid Uint8Array.
    encrypted.binary = new Uint8Array([1, 2])

    const decrypted = await crypto.decryptFile(secretKey, encrypted)

    expect(decrypted).toBeNull()
  })

  it('should throw error if class was not instantiated with a public signing key while verifying decrypted content ', () => {
    // Arrange
    const cryptoNoKey = new Crypto()
    const { publicKey, secretKey } = cryptoNoKey.generate()

    // Act
    // Encrypt content that is not signed.
    const ciphertext = cryptoNoKey.encrypt(plaintext, publicKey)
    // Sign and encrypt the desired content.
    const signedAndEncryptedText = cryptoNoKey.encrypt(
      mockVerifiedContent,
      publicKey,
      signingSecretKey
    )

    // Assert
    // Attempt to decrypt encrypted content along with our signed+encrypted
    // content should throw an error
    expect(() =>
      cryptoNoKey.decrypt(secretKey, {
        encryptedContent: ciphertext,
        verifiedContent: signedAndEncryptedText,
        version: INTERNAL_TEST_VERSION,
      })
    ).toThrow(MissingPublicKeyError)
  })

  it('should return null if decrypting encrypted verified content failed', () => {
    // Arrange
    const { publicKey, secretKey } = crypto.generate()
    // Encrypt content that is not signed.
    const ciphertext = crypto.encrypt(plaintext, publicKey)
    // Create rubbish verified content
    const rubbishVerifiedContent = 'abcdefg'

    // Act + Assert
    const decryptResult = crypto.decrypt(secretKey, {
      encryptedContent: ciphertext,
      verifiedContent: rubbishVerifiedContent,
      version: INTERNAL_TEST_VERSION,
    })
    expect(decryptResult).toBeNull()
  })
})
