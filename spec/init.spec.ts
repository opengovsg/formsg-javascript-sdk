import formsg from '../src/index'
import { SIGNING_KEYS } from '../src/resource/signing-keys'
import { VERIFICATION_KEYS } from '../src/resource/verification-keys'
import {
  getSigningPublicKey,
  getVerificationPublicKey,
} from '../src/util/publicKey'

describe('FormSG SDK', () => {
  describe('Initialisation', () => {
    it('should be able to initialise without arguments', async () => {
      const sdk = await formsg()
      const signingKey = await sdk.crypto.getSigningPublicKey()
      const verificationKey = await sdk.verification.getVerificationPublicKey()
      const webhooksKey = await sdk.webhooks.getPublicKey()

      expect(signingKey).toEqual(SIGNING_KEYS.production.publicKey)
      expect(verificationKey).toEqual(VERIFICATION_KEYS.production.publicKey)
      expect(webhooksKey).toEqual(SIGNING_KEYS.production.publicKey)
    })

    it('should correctly assign given webhook signing key', async () => {
      const mockSecretKey = 'mock secret key'
      const sdk = await formsg({
        webhookSecretKey: mockSecretKey,
      })

      expect(sdk.webhooks.secretKey).toEqual(mockSecretKey)
    })

    it('should be able to initialise with valid verification options', async () => {
      const TEST_TRANSACTION_EXPIRY = 10000
      const sdk = await formsg({
        mode: 'test',
        verificationOptions: {
          secretKey: VERIFICATION_KEYS.test.secretKey,
          transactionExpiry: TEST_TRANSACTION_EXPIRY,
        },
      })

      const verificationKey = await sdk.verification.getVerificationPublicKey()
      expect(verificationKey).toEqual(VERIFICATION_KEYS.test.publicKey)
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

    it('should get the correct signing key given a mode', () => {
      expect(getSigningPublicKey('test')).toBe(SIGNING_KEYS.test.publicKey)
      expect(getSigningPublicKey('staging')).toBe(
        SIGNING_KEYS.staging.publicKey
      )
      expect(getSigningPublicKey('development')).toBe(
        SIGNING_KEYS.development.publicKey
      )
      expect(getSigningPublicKey('production')).toBe(
        SIGNING_KEYS.production.publicKey
      )
      expect(getSigningPublicKey()).toBe(SIGNING_KEYS.production.publicKey)
    })
  })
})
