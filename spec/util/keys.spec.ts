import { JwksConfig } from '../../src/types'
import { getPublicKeys } from '../../src/util/keys'
import * as jwksModule from '../../src/util/jwks'
import * as publicKeyModule from '../../src/util/publicKey'
import { mock } from 'node:test'

// Mock imported modules
jest.mock('../../src/util/jwks')
jest.mock('../../src/util/publicKey')

describe('getPublicKeys', () => {
  const mockJwks: JwksConfig = { url: 'https://example.com/jwks.json' }
  const mockWebhookPublicKey = 'mock-webhook-public-key'
  const mockVerificationPublicKey = 'mock-verification-public-key'
  const mockSigningKey = 'mock-signing-key'
  const mockVerificationKey = 'mock-verification-key'
  const mockJwksSigningKeys = [
    'mock-jwks-signing-key-1',
    'mock-jwks-signing-key-2',
  ]
  const mockJwksVerificationKeys = [
    'mock-jwks-verification-key-1',
    'mock-jwks-verification-key-2',
  ]

  beforeEach(() => {
    jest.resetAllMocks()

    // Mock jwks module
    jest.mocked(jwksModule.initJwks).mockResolvedValue(undefined)
    jest
      .mocked(jwksModule.getSigningPublicKeysFromJwks)
      .mockResolvedValue(mockJwksSigningKeys)
    jest
      .mocked(jwksModule.getVerificationPublicKeysFromJwks)
      .mockResolvedValue(mockJwksVerificationKeys)

    // Mock publicKey module
    jest
      .mocked(publicKeyModule.getSigningPublicKey)
      .mockReturnValue(mockSigningKey)
    jest
      .mocked(publicKeyModule.getVerificationPublicKey)
      .mockReturnValue(mockVerificationKey)
  })

  describe('signingPublicKeys', () => {
    it('should return keys from JWKS when JWKS URL is provided', async () => {
      const { signingPublicKeys } = await getPublicKeys({ jwks: mockJwks })
      const keys = await signingPublicKeys()

      expect(jwksModule.initJwks).toHaveBeenCalledWith(mockJwks)
      expect(jwksModule.getSigningPublicKeysFromJwks).toHaveBeenCalled()
      expect(keys).toEqual(mockJwksSigningKeys)
    })

    it('should pass keyId to getSigningPublicKeysFromJwks when provided', async () => {
      const keyId = 'test-key-id'
      const { signingPublicKeys } = await getPublicKeys({ jwks: mockJwks })
      await signingPublicKeys(keyId)

      expect(jwksModule.getSigningPublicKeysFromJwks).toHaveBeenCalledWith(
        keyId
      )
    })

    it('should return webhookPublicKey when JWKS URL is not provided but webhookPublicKey is', async () => {
      const { signingPublicKeys } = await getPublicKeys({
        webhookPublicKey: mockWebhookPublicKey,
      })
      const keys = await signingPublicKeys()

      expect(jwksModule.initJwks).not.toHaveBeenCalled()
      expect(keys).toEqual([mockWebhookPublicKey])
    })

    it('should return default signing key when neither JWKS URL nor webhookPublicKey are provided', async () => {
      const mode = 'production'
      const { signingPublicKeys } = await getPublicKeys({ mode: mode })
      const keys = await signingPublicKeys()

      expect(publicKeyModule.getSigningPublicKey).toHaveBeenCalledWith(mode)
      expect(keys).toEqual([mockSigningKey])
    })

    it('should fallback to webhookPublicKey when JWKS retrieval fails', async () => {
      ;(jwksModule.getSigningPublicKeysFromJwks as jest.Mock).mockRejectedValue(
        new Error('JWKS error')
      )
      const { signingPublicKeys } = await getPublicKeys({
        jwks: mockJwks,
        webhookPublicKey: mockWebhookPublicKey,
      })
      const keys = await signingPublicKeys()

      expect(jwksModule.getSigningPublicKeysFromJwks).toHaveBeenCalled()
      expect(keys).toEqual([mockWebhookPublicKey])
    })

    it('should fallback to default key when JWKS fails and no webhookPublicKey is provided', async () => {
      ;(jwksModule.getSigningPublicKeysFromJwks as jest.Mock).mockRejectedValue(
        new Error('JWKS error')
      )
      const mode = 'production'
      const { signingPublicKeys } = await getPublicKeys({
        jwks: mockJwks,
        mode: mode,
      })
      const keys = await signingPublicKeys()

      expect(jwksModule.getSigningPublicKeysFromJwks).toHaveBeenCalled()
      expect(publicKeyModule.getSigningPublicKey).toHaveBeenCalledWith(mode)
      expect(keys).toEqual([mockSigningKey])
    })
  })

  describe('verificationPublicKeys', () => {
    it('should return keys from JWKS when JWKS URL is provided', async () => {
      const { verificationPublicKeys } = await getPublicKeys({ jwks: mockJwks })
      const keys = await verificationPublicKeys()

      expect(jwksModule.initJwks).toHaveBeenCalledWith(mockJwks)
      expect(jwksModule.getVerificationPublicKeysFromJwks).toHaveBeenCalled()
      expect(keys).toEqual(mockJwksVerificationKeys)
    })

    it('should pass keyId to getVerificationPublicKeysFromJwks when provided', async () => {
      const keyId = 'test-key-id'
      const { verificationPublicKeys } = await getPublicKeys({ jwks: mockJwks })
      await verificationPublicKeys(keyId)

      expect(jwksModule.getVerificationPublicKeysFromJwks).toHaveBeenCalledWith(
        keyId
      )
    })

    it('should return verificationPublicKey when JWKS URL is not provided but verificationPublicKey is', async () => {
      const { verificationPublicKeys } = await getPublicKeys({
        verificationPublicKey: mockVerificationPublicKey,
      })
      const keys = await verificationPublicKeys()

      expect(jwksModule.initJwks).not.toHaveBeenCalled()
      expect(keys).toEqual([mockVerificationPublicKey])
    })

    it('should return default verification key when neither JWKS URL nor verificationPublicKey are provided', async () => {
      const mode = 'production'
      const { verificationPublicKeys } = await getPublicKeys({ mode: mode })
      const keys = await verificationPublicKeys()

      expect(publicKeyModule.getVerificationPublicKey).toHaveBeenCalledWith(
        mode
      )
      expect(keys).toEqual([mockVerificationKey])
    })

    it('should fallback to verificationPublicKey when JWKS retrieval fails', async () => {
      ;(
        jwksModule.getVerificationPublicKeysFromJwks as jest.Mock
      ).mockRejectedValue(new Error('JWKS error'))
      const { verificationPublicKeys } = await getPublicKeys({
        jwks: mockJwks,
        verificationPublicKey: mockVerificationPublicKey,
      })
      const keys = await verificationPublicKeys()

      expect(jwksModule.getVerificationPublicKeysFromJwks).toHaveBeenCalled()
      expect(keys).toEqual([mockVerificationPublicKey])
    })

    it('should fallback to default key when JWKS fails and no verificationPublicKey is provided', async () => {
      ;(
        jwksModule.getVerificationPublicKeysFromJwks as jest.Mock
      ).mockRejectedValue(new Error('JWKS error'))
      const mode = 'production'
      const { verificationPublicKeys } = await getPublicKeys({
        jwks: mockJwks,
        mode: mode,
      })
      const keys = await verificationPublicKeys()

      expect(jwksModule.getVerificationPublicKeysFromJwks).toHaveBeenCalled()
      expect(publicKeyModule.getVerificationPublicKey).toHaveBeenCalledWith(
        mode
      )
      expect(keys).toEqual([mockVerificationKey])
    })
  })
})
