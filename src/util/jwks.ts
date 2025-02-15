import axios from 'axios'

import { JwksConfig } from '../types'

import { Cache } from './cache'
import {
  DEFAULT_JWKS_CACHE_DURATION_MS,
  DEFAULT_JWKS_TIMEOUT_MS,
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

const findKeyByUse = (jwks: JwksResponse, use: 'sig' | 'verify'): string[] => {
  const keys = jwks.keys.filter((k) => k.use === use)

  if (keys.length === 0) {
    throw new Error(`No keys with use="${use}" found in JWKS`)
  }

  // Keys should be used in the order they appear in the JWKS response
  // Server should return keys in priority order
  return keys.map((k) => base64UrlToBase64(k.x))
}

const getJwks = async (): Promise<JwksResponse> => {
  if (!jwksConfig) throw new Error('JWKS not initialized')

  const cached = jwksCache?.get()
  if (cached) return cached

  if (!jwksCache) {
    jwksCache = new Cache(
      jwksConfig.cacheDurationMs ?? DEFAULT_JWKS_CACHE_DURATION_MS
    )
  }

  try {
    const { data } = await axios.get(jwksConfig.url, {
      timeout: jwksConfig.timeoutMs ?? DEFAULT_JWKS_TIMEOUT_MS,
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

  // Default to true if not specified
  if (jwksConfig.loadOnInit !== false) {
    try {
      await getJwks()
    } catch (error) {
      console.warn('Failed to pre-fetch JWKS during initialization:', error)
    }
  }
}

export const getSigningPublicKeyFromJwks = async (): Promise<string[]> => {
  const jwks = await getJwks()
  return findKeyByUse(jwks, 'sig')
}

export const getVerificationPublicKeyFromJwks = async (): Promise<string[]> => {
  const jwks = await getJwks()
  return findKeyByUse(jwks, 'verify')
}
