import axios from 'axios'
import {
  initJwks,
  getSigningPublicKeyFromJwks,
  getVerificationPublicKeyFromJwks,
} from '../../src/util/jwks'
import { DEFAULT_JWKS_TIMEOUT_MS } from '../../src/util/constants'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('jwks', () => {
  const MOCK_JWKS_URL = 'https://test.example.com/.well-known/jwks.json'
  const MOCK_JWKS_RESPONSE = {
    keys: [
      {
        kty: 'OKP',
        kid: '1',
        use: 'sig',
        alg: 'EdDSA',
        crv: 'Ed25519',
        x: 'abc-123_test', // this will be converted from base64url to base64
      },
      {
        kty: 'OKP',
        kid: '2',
        use: 'verify',
        alg: 'EdDSA',
        crv: 'Ed25519',
        x: 'def-456_test', // this will be converted from base64url to base64
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    initJwks({ url: MOCK_JWKS_URL })
  })

  it('should fetch and return signing public key', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })

    const result = await getSigningPublicKeyFromJwks()

    expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
      timeout: DEFAULT_JWKS_TIMEOUT_MS,
    })
    expect(result).toBe('abc+123/test') // converted from base64url to base64
  })

  it('should fetch and return verification public key', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })

    const result = await getVerificationPublicKeyFromJwks()

    expect(result).toBe('def+456/test') // converted from base64url to base64
  })

  it('should respect custom timeout', async () => {
    const customTimeout = 5000
    initJwks({ url: MOCK_JWKS_URL, timeoutMs: customTimeout })
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })

    await getSigningPublicKeyFromJwks()

    expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
      timeout: customTimeout,
    })
  })

  it('should respect custom cache duration', async () => {
    const customDuration = 2000
    initJwks({ url: MOCK_JWKS_URL, cacheDurationMs: customDuration })
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })

    await getSigningPublicKeyFromJwks()

    jest.advanceTimersByTime(customDuration + 100)

    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await getSigningPublicKeyFromJwks()

    expect(mockedAxios.get).toHaveBeenCalledTimes(2)
  })

  it('should use cache for subsequent requests', async () => {
    initJwks({ url: MOCK_JWKS_URL, cacheDurationMs: 20000 })
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })

    await getSigningPublicKeyFromJwks()
    await getSigningPublicKeyFromJwks()
    await getSigningPublicKeyFromJwks()

    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
  })

  it('should throw error if JWKS not initialized', async () => {
    initJwks(null as any)

    await expect(getSigningPublicKeyFromJwks()).rejects.toThrow(
      'JWKS not initialized'
    )
  })

  it('should throw error if key not found', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { keys: [{ use: 'other' }] },
    })

    await expect(getSigningPublicKeyFromJwks()).rejects.toThrow(
      'No key with use="sig" found in JWKS'
    )
  })

  it('should throw error on network failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

    await expect(getSigningPublicKeyFromJwks()).rejects.toThrow(
      'Failed to fetch JWKS: Network error'
    )
  })

  it('should throw error when request times out', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded')
    timeoutError.name = 'TimeoutError'
    mockedAxios.get.mockRejectedValueOnce(timeoutError)

    await expect(getSigningPublicKeyFromJwks()).rejects.toThrow(
      'Failed to fetch JWKS: timeout of 5000ms exceeded'
    )
  })
})
