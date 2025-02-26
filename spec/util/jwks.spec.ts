import mockAxios from 'jest-mock-axios'
import {
  initJwks,
  getSigningPublicKeysFromJwks,
  getVerificationPublicKeysFromJwks,
} from '../../src/util/jwks'
import { DEFAULT_JWKS_TIMEOUT_MS } from '../../src/util/constants'
import { MOCK_JWKS_URL, MOCK_JWKS_RESPONSE } from './testUtils'

jest.mock('axios', () => mockAxios)

describe('jwks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAxios.reset()
  })

  describe('initialization', () => {
    it('should not pre-fetch JWKS when loadOnInit is explicitly false', async () => {
      await initJwks({ url: MOCK_JWKS_URL, loadOnInit: false })
      expect(mockAxios.get).not.toHaveBeenCalled()
    })

    it('should pre-fetch JWKS by default when loadOnInit is undefined', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL })

      expect(mockAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
        timeout: DEFAULT_JWKS_TIMEOUT_MS,
      })
    })

    it('should pre-fetch JWKS when loadOnInit is true', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL, loadOnInit: true })

      expect(mockAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
        timeout: DEFAULT_JWKS_TIMEOUT_MS,
      })
    })

    it('should not throw if pre-fetch fails during initialization', async () => {
      mockAxios.get.mockRejectedValue(new Error('Network error'))

      await expect(initJwks({ url: MOCK_JWKS_URL })).resolves.not.toThrow()
    })

    it('should reset cache when reinitializing', async () => {
      mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL })

      // Second initialization should trigger new fetch
      mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
      await initJwks({ url: MOCK_JWKS_URL })

      expect(mockAxios.get).toHaveBeenCalledTimes(2)
    })
  })

  it('should fetch and return signing public key', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL })
    const result = await getSigningPublicKeysFromJwks()

    expect(result).toStrictEqual(['abc+123/test']) // converted from base64url to base64
  })

  it('should fetch and return verification public key', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL })

    const result = await getVerificationPublicKeysFromJwks()
    expect(result).toStrictEqual(['def+456/test']) // converted from base64url to base64
  })

  it('should respect custom timeout', async () => {
    const customTimeout = 5000
    mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })

    await initJwks({
      url: MOCK_JWKS_URL,
      requestConfig: { timeoutMs: customTimeout },
    })

    expect(mockAxios.get).toHaveBeenCalledWith(MOCK_JWKS_URL, {
      timeout: customTimeout,
    })
  })

  it('should respect custom cache duration', async () => {
    jest.useFakeTimers()

    const customDuration = 2000
    mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL, cacheDurationMs: customDuration })

    // Should not call, as still cached
    await getSigningPublicKeysFromJwks()
    jest.advanceTimersByTime(customDuration + 100)

    mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await getSigningPublicKeysFromJwks()

    expect(mockAxios.get).toHaveBeenCalledTimes(2)
  })

  it('should use cache for subsequent requests', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: MOCK_JWKS_RESPONSE })
    await initJwks({ url: MOCK_JWKS_URL, cacheDurationMs: 20000 })

    // These should use the cache from initialization
    await getSigningPublicKeysFromJwks()
    await getSigningPublicKeysFromJwks()
    await getSigningPublicKeysFromJwks()

    expect(mockAxios.get).toHaveBeenCalledTimes(1)
  })

  it('should throw error if JWKS not initialized', async () => {
    await initJwks(null as any)
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'JWKS not initialized'
    )
  })

  it('should throw error if key not found', async () => {
    jest.useFakeTimers()
    mockAxios.get.mockResolvedValueOnce({
      data: { keys: [{ use: 'other' }] },
    })
    await initJwks({ url: MOCK_JWKS_URL })
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'No keys with use="sig" found in JWKS'
    )
  })

  it('should throw error on network failure', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'))
    await initJwks({ url: MOCK_JWKS_URL })

    // Should still fail on subsequent request
    mockAxios.get.mockRejectedValueOnce(new Error('Network error'))
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'Failed to fetch JWKS: Network error'
    )
  })

  it('should throw error when request times out', async () => {
    const timeoutError = new Error('timeout of 5000ms exceeded')
    timeoutError.name = 'TimeoutError'

    // Every get returns a timeout error, init shouldn't throw
    mockAxios.get.mockRejectedValue(timeoutError)
    await expect(initJwks({ url: MOCK_JWKS_URL })).resolves.not.toThrow()

    // Should still fail on subsequent request
    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'Failed to fetch JWKS: timeout of 5000ms exceeded'
    )
  })

  afterEach(() => {
    jest.useRealTimers()
  })
})
