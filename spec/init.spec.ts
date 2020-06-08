import formsg from '../src/index'
import {
  getVerificationPublicKey,
  getSigningPublicKey,
} from '../src/util/publicKey'
import { VERIFICATION_KEYS } from '../src/resource/verification-keys'
import { SIGNING_KEYS } from '../src/resource/signing-keys'
import Webhooks from '../src/webhooks'
import Crypto from '../src/crypto'
import Verification from '../src/verification'

const TEST_PUBLIC_KEY = SIGNING_KEYS.test.publicKey

describe('FormSG SDK', () => {
  describe('Initialisation', () => {
    it('should be able to initialise without arguments', () => {
      expect(() => formsg()).not.toThrow()
    })

    it('should be able to initialise with valid verification options', () => {
      // Arrange
      const TEST_TRANSACTION_EXPIRY = 10000
      const sdk = formsg({
        mode: 'test',
        verificationOptions: {
          secretKey: VERIFICATION_KEYS.test.secretKey,
          transactionExpiry: TEST_TRANSACTION_EXPIRY,
        },
      })

      expect(sdk.verification.verificationPublicKey).toEqual(
        VERIFICATION_KEYS.test.publicKey
      )
      expect(sdk.verification.verificationSecretKey).toEqual(
        VERIFICATION_KEYS.test.secretKey
      )
      expect(sdk.verification.transactionExpiry).toEqual(
        TEST_TRANSACTION_EXPIRY
      )
    })
  })

  describe('Public keys', () => {
    it('should get the correct verification public key given a mode', () => {
      expect(getVerificationPublicKey('test')).toBe(
        VERIFICATION_KEYS.test.publicKey
      )
      expect(getVerificationPublicKey('staging')).toBe(
        VERIFICATION_KEYS.staging.publicKey
      )
      expect(getVerificationPublicKey('development')).toBe(
        VERIFICATION_KEYS.development.publicKey
      )
      expect(getVerificationPublicKey('production')).toBe(
        VERIFICATION_KEYS.production.publicKey
      )
      expect(getVerificationPublicKey()).toBe(
        VERIFICATION_KEYS.production.publicKey
      )
    })
  })

  it('should get the correct signing key given a mode', () => {
    expect(getSigningPublicKey('test')).toBe(SIGNING_KEYS.test.publicKey)
    expect(getSigningPublicKey('staging')).toBe(SIGNING_KEYS.staging.publicKey)
    expect(getSigningPublicKey('development')).toBe(
      SIGNING_KEYS.development.publicKey
    )
    expect(getSigningPublicKey('production')).toBe(
      SIGNING_KEYS.production.publicKey
    )
    expect(getSigningPublicKey()).toBe(SIGNING_KEYS.production.publicKey)
  })

  it('should be able to initialise with given publicKey init param', () => {
    // Arrange
    // Expected inner class public keys
    const expectedWebhookPublicKey = new Webhooks({
      publicKey: TEST_PUBLIC_KEY,
    }).publicKey
    const expectedCryptoPublicKey = new Crypto({
      publicSigningKey: TEST_PUBLIC_KEY,
    }).publicSigningKey
    const expectedVerificationPublicKey = new Verification({
      verificationPublicKey: TEST_PUBLIC_KEY,
    }).verificationPublicKey

    // Act
    // Create SDK with a public key
    const sdk = formsg({ publicKey: TEST_PUBLIC_KEY })

    // Assert
    expect(sdk.crypto.publicSigningKey).toEqual(expectedCryptoPublicKey)
    expect(sdk.verification.verificationPublicKey).toEqual(
      expectedVerificationPublicKey
    )
    expect(sdk.webhooks.publicKey).toEqual(expectedWebhookPublicKey)
  })
})
