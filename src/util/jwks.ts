import axios from 'axios'
import axiosRetry from 'axios-retry'

import { JwksConfig } from '../types'

import { Cache } from './cache'
import {
  DEFAULT_JWKS_CACHE_DURATION_MS,
  DEFAULT_JWKS_TIMEOUT_MS,
  JWKS_INITIAL_BACKOFF_MS,
  JWKS_MAX_RETRIES,
  JWKS_RETRY_STATUS_CODES,
} from './constants'

interface JwksKey {
  kty: 'OKP'
  kid: string
  use: 'sig' | 'verify'
  alg: 'EdDSA'
  crv: 'Ed25519'
  x: string
}

interface JwksResponse {
  keys: JwksKey[]
}

let jwksCache: Cache<JwksResponse> | null = null
let jwksConfig: JwksConfig | null = null

/**
 * Convert base64url to standard base64
 * Spec: https://tools.ietf.org/html/rfc4648#section-5
 */
const base64UrlToBase64 = (base64url: string): string => {
  // Convert URL-safe characters back to standard base64 characters
  const converted = base64url.replace(/-/g, '+').replace(/_/g, '/')

  // Add padding if necessary
  const pad = converted.length % 4
  if (pad) {
    return converted + '='.repeat(4 - pad)
  }
  return converted
}

const findKeysByUse = (
  jwks: JwksResponse,
  use: 'sig' | 'verify',
  keyId?: string
): string[] => {
  if (keyId) {
    const key = jwks.keys.find((k) => k.kid === keyId)
    if (!key) {
      throw new Error(`Key with kid="${keyId}" not found in JWKS`)
    }
    return [base64UrlToBase64(key.x)]
  }

  const keys = jwks.keys.filter((k) => k.use === use)
  if (keys.length === 0) {
    throw new Error(`No keys with use="${use}" found in JWKS`)
  }

  // Keys should be used in the order they appear in the JWKS response
  // Server should return keys in priority order
  return keys.map((k) => base64UrlToBase64(k.x))
}

const getJwks = async (getJwksOptions?: {
  forceCacheRefresh?: boolean
}): Promise<JwksResponse> => {
  if (!jwksConfig) throw new Error('JWKS not initialized')

  const forceCacheRefresh = getJwksOptions?.forceCacheRefresh ?? false
  const cached = jwksCache?.get()
  if (cached && !forceCacheRefresh) return cached

  if (!jwksCache) {
    jwksCache = new Cache(
      jwksConfig.cacheDurationMs ?? DEFAULT_JWKS_CACHE_DURATION_MS
    )
  }

  try {
    const { data } = await axios.get(jwksConfig.url, {
      timeout: jwksConfig.requestConfig?.timeoutMs ?? DEFAULT_JWKS_TIMEOUT_MS,
    })
    jwksCache.set(data)

    return data
  } catch (error) {
    throw new Error(
      `Failed to fetch JWKS: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

export const initJwks = async (config: JwksConfig): Promise<void> => {
  jwksConfig = config
  jwksCache = null

  if (!jwksConfig) return

  axiosRetry(axios, {
    retries: config.requestConfig?.retry?.maxRetries ?? JWKS_MAX_RETRIES,
    retryDelay: (...arg) =>
      axiosRetry.exponentialDelay(
        ...arg,
        config.requestConfig?.retry?.initialBackoffMs ?? JWKS_INITIAL_BACKOFF_MS
      ),
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        JWKS_RETRY_STATUS_CODES.includes(error.response?.status ?? 0)
      )
    },
    shouldResetTimeout: true, // each retry will wait for the full timeout duration
  })

  // Default to true if not specified
  if (jwksConfig.loadOnInit !== false) {
    try {
      await getJwks()
    } catch (error) {
      console.warn('Failed to pre-fetch JWKS during initialization:', error)
    }
  }
}

export const getSigningPublicKeysFromJwks = async (
  keyId?: string
): Promise<string[]> => {
  try {
    const jwks = await getJwks()
    return findKeysByUse(jwks, 'sig', keyId)
  } catch (error) {
    if (keyId) {
      // force a cache refresh and try again in case of stale cache
      const refreshedJwks = await getJwks({ forceCacheRefresh: true })
      return findKeysByUse(refreshedJwks, 'sig', keyId)
    }

    throw error
  }
}

export const getVerificationPublicKeysFromJwks = async (
  keyId?: string
): Promise<string[]> => {
  try {
    const jwks = await getJwks()
    return findKeysByUse(jwks, 'verify', keyId)
  } catch (error) {
    if (keyId) {
      // force a cache refresh and try again in case of stale cache
      const refreshedJwks = await getJwks({ forceCacheRefresh: true })
      return findKeysByUse(refreshedJwks, 'verify', keyId)
    }

    throw error
  }
}
