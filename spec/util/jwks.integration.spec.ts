import nock from 'nock'
import { initJwks, getSigningPublicKeysFromJwks } from '../../src/util/jwks'
import { MOCK_JWKS_URL, MOCK_JWKS_RESPONSE } from './testUtils'

// mock http response instead of mocking axios, as mocked axios wouldn't be aware of axios-retry
describe('jwks retries', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('should retry failed requests with exponential backoff and eventually succeed', async () => {
    await initJwks({
      url: MOCK_JWKS_URL,
      loadOnInit: false, // don't populate cache
      requestConfig: {
        timeoutMs: 50,
        retry: {
          maxRetries: 3,
          initialBackoffMs: 100,
        },
      },
    })

    // retry scenario
    nock('https://test.example.com')
      .get('/.well-known/jwks.json')
      .times(1)
      .replyWithError('Network failure')
    nock('https://test.example.com')
      .get('/.well-known/jwks.json')
      .times(1)
      .reply(500, 'Server error')
    nock('https://test.example.com')
      .get('/.well-known/jwks.json')
      .reply(200, MOCK_JWKS_RESPONSE)

    const result = await getSigningPublicKeysFromJwks()

    expect(result).toStrictEqual(['abc+123/test'])
    expect(nock.isDone()).toBe(true)
  })

  it('should throw error when all retry attempts fail', async () => {
    await initJwks({
      url: MOCK_JWKS_URL,
      loadOnInit: false,
      requestConfig: {
        timeoutMs: 50,
        retry: {
          maxRetries: 3,
          initialBackoffMs: 100,
        },
      },
    })

    nock('https://test.example.com')
      .get('/.well-known/jwks.json')
      .times(4) // always fail
      .reply(500, 'Server error')

    await expect(getSigningPublicKeysFromJwks()).rejects.toThrow(
      'Failed to fetch JWKS: Request failed with status code 500'
    )
    expect(nock.isDone()).toBe(true)
  })

  afterEach(() => {
    jest.useRealTimers()
    nock.cleanAll()
  })
})
