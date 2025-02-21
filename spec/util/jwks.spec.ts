import axios from 'axios'
import {
  initJwks,
  getSigningPublicKeysFromJwks,
  getVerificationPublicKeysFromJwks,
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
  })

  describe('initialization', () => {
    it('should not pre-fetch JWKS when loadOnInit is explicitly false', async () => {
      await initJwks({ url: MOCK_JWKS_URL, loadOnInit: false })
      expect(mockedAxios.get).not.toHaveBeenCalled()
    })

    it('should pre-fetch JWKS by default when loadOnInit is undefined', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL })

      expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
        timeout: DEFAULT_JWKS_TIMEOUT_MS,
      })
    })

    it('should pre-fetch JWKS when loadOnInit is true', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL, loadOnInit: true })

      expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
        timeout: DEFAULT_JWKS_TIMEOUT_MS,
      })
    })

    it('should not throw if pre-fetch fails during initialization', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(initJwks({ url: MOCK_JWKS_URL })).resolves.not.toThrow()
    })

    it('should reset cache when reinitializing', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL })

      // Second initialization should trigger new fetch
      mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL })

      expect(mockedAxios.get).toHaveBeenCalledTimes(2)
    })
  })

  it('should fetch and return signing public key', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL })
    const result = await getSigningPublicKeysFromJwks()

    expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
      timeout: DEFAULT_JWKS_TIMEOUT_MS,
    })
    expect(result).toStrictEqual(['abc+123/test']) // converted from base64url to base64
  })

  it('should fetch and return verification public key', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL })

    const result = await getVerificationPublicKeysFromJwks()
    expect(result).toStrictEqual(['def+456/test']) // converted from base64url to base64
  })

  it('should respect custom timeout', async () => {
    const customTimeout = 5000
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL, timeoutMs: customTimeout })

    expect(mockedAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
      timeout: customTimeout,
    })
  })

  it('should respect custom cache duration', async () => {
    const customDuration = 2000
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL, cacheDurationMs: customDuration })

    // Should not call, as still cached
    await getSigningPublicKeysFromJwks()
    jest.advanceTimersByTime(customDuration + 100)

    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await getSigningPublicKeysFromJwks()

    expect(mockedAxios.get).toHaveBeenCalledTimes(2)
  })

  it('should use cache for subsequent requests', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL, cacheDurationMs: 20000 })

    // These should use the cache from initialization
    await getSigningPublicKeysFromJwks()
    await getSigningPublicKeysFromJwks()
    await getSigningPublicKeysFromJwks()

    expect(mockedAxios.get).toHaveBeenCalledTimes(1)
  })

  it('should throw error if JWKS not initialized', async () => {
    await initJwks(null as any)
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'JWKS not initialized'
    )
  })

  it('should throw error if key not found', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { keys: [{ use: 'other' }] },
    })
    await initJwks({ url: MOCK_JWKS_URL })
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'No keys with use="sig" found in JWKS'
    )
  })

  it('should throw error on network failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
    await initJwks({ url: MOCK_JWKS_URL })

    // Should still fail on subsequent request
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'Failed to fetch JWKS: Network error'
    )
  })

  it('should throw error when request times out', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded')
    timeoutError.name = 'TimeoutError'

    // Initialize with timeout error
    mockedAxios.get.mockRejectedValueOnce(timeoutError)
    await initJwks({ url: MOCK_JWKS_URL })

    // Should still fail on subsequent request
    mockedAxios.get.mockRejectedValueOnce(timeoutError)
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'Failed to fetch JWKS: timeout of 5000ms exceeded'
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })
})
