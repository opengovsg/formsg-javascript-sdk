import axios from 'axios'
import formsg from '../src/index'
import { SIGNING_KEYS } from '../src/resource/signing-keys'
import { VERIFICATION_KEYS } from '../src/resource/verification-keys'
import {
  getSigningPublicKey,
  getVerificationPublicKey,
} from '../src/util/publicKey'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('FormSG SDK', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initialisation', () => {
    it('should be able to initialise without arguments', async () => {
      const sdk = await formsg()
      const [signingKey] = await sdk.crypto.getSigningPublicKeys!()
      const [verificationKey] = await sdk.verification
        .getVerificationPublicKeys!()
      const [webhooksKey] = await sdk.webhooks.getPublicKeys()

      expect(signingKey).toEqual(SIGNING_KEYS.production.publicKey)
      expect(verificationKey).toEqual(VERIFICATION_KEYS.production.publicKey)
      expect(webhooksKey).toEqual(SIGNING_KEYS.production.publicKey)
    })

    it('should correctly assign given webhook signing key', async () => {
      const mockSecretKey = 'mock secret key'
      const sdk = await formsg({
        webhookOptions: {
          secretKey: mockSecretKey,
        },
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

      const [verificationKey] = await sdk.verification
        .getVerificationPublicKeys!()
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

  describe('JWKS Initialization', () => {
    const MOCK_JWKS_URL = 'https://test-jwks-endpoint.com/.well-known/jwks.json'
    const MOCK_JWKS_RESPONSE = {
      keys: [
        {
          kty: 'OKP',
          kid: 'sig-1',
          use: 'sig',
          alg: 'EdDSA',
          crv: 'Ed25519',
          x: 'mock-signing-key', // this will be converted from base64url to base64
        },
        {
          kty: 'OKP',
          kid: 'verify-1',
          use: 'verify',
          alg: 'EdDSA',
          crv: 'Ed25519',
          x: 'mock-verification-key', // this will be converted from base64url to base64
        },
      ],
    }

    it('should initialize with JWKS configuration', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })

      const sdk = await formsg({
        jwks: {
          url: MOCK_JWKS_URL,
        },
      })

      const [signingKey] = await sdk.crypto.getSigningPublicKeys!()
      const [verificationKey] = await sdk.verification
        .getVerificationPublicKeys!()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        MOCK_JWKS_URL,
        expect.any(Object)
      )
      expect(signingKey).toBe('mock+signing+key')
      expect(verificationKey).toBe('mock+verification+key===')
    })

    it('should fallback to static keys when JWKS endpoint fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('JWKS fetch failed'))

      const sdk = await formsg({
        mode: 'production',
        jwks: {
          url: MOCK_JWKS_URL,
        },
      })

      const [signingKey] = await sdk.crypto.getSigningPublicKeys!()
      const [verificationKey] = await sdk.verification
        .getVerificationPublicKeys!()

      expect(signingKey).toBe(SIGNING_KEYS.production.publicKey)
      expect(verificationKey).toBe(VERIFICATION_KEYS.production.publicKey)
    })
  })
})
