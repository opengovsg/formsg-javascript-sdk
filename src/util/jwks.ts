import axios from 'axios'

import mockJwks from '../resource/mock-jwks.json'
import { JwksConfig } from '../types'

import {
  DEFAULT_JWKS_CACHE_DURATION_MS,
  DEFAULT_JWKS_TIMEOUT_MS,
  MAX_CACHE_DURATION_MS,
} from './constants'

// import { toBase64Url } from './base64'

export interface JwksKey {
  kty: string
  kid: string
  use: string
  alg: string
  crv?: string
  x?: string // For Ed25519 keys
  y?: string // For EC keys
  n?: string // For RSA keys
  e?: string // For RSA keys
}

// TODO: use actual cached JWKS
let cachedJwks = mockJwks
let lastFetchTime = 0

export const fetchJwks = async (config: JwksConfig): Promise<void> => {
  const {
    url,
    timeoutMs = DEFAULT_JWKS_TIMEOUT_MS,
    cacheDurationMs = DEFAULT_JWKS_CACHE_DURATION_MS,
  } = config

  // Enforce maximum cache duration to avoid potential issues
  const safeCacheDuration = Math.min(cacheDurationMs, MAX_CACHE_DURATION_MS)

  // Check cache validity
  if (lastFetchTime && Date.now() - lastFetchTime < safeCacheDuration) {
    return
  }

  try {
    const { data } = await axios.get(url, { timeout: timeoutMs })
    cachedJwks = data
    lastFetchTime = Date.now()
  } catch (error) {
    console.warn('Failed to fetch JWKS, falling back to mock JWKS:', error)
  }
}

export const getKeyFromJwks = (
  kid: string,
  jwks: { keys: JwksKey[] }
): string | null => {
  const key = jwks.keys.find((k) => k.kid === kid)
  if (!key) return null

  // Handle Ed25519 keys - a type of Edwards-curve key
  if (key.kty === 'OKP' && key.crv === 'Ed25519' && key.x) {
    const base64 = key.x.replace(/-/g, '+').replace(/_/g, '/')
    return base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  }

  // Handle EC keys (like P-256, P-384, P-521)
  if (key.kty === 'EC') {
    // EC keys require both x and y coordinates
    if (!key.x || !key.y) return null
    // Return concatenated x and y coordinates
    return key.x + key.y
  }

  // Handle RSA keys
  if (key.kty === 'RSA') {
    return key.n ?? null
  }

  return null
}

export const getSigningPublicKeyFromJwks = (): string => {
  const signingKid = 'signing-d26b11d1-4a03-40df-9b88-2234eac30ef7'
  const key = getKeyFromJwks(signingKid, cachedJwks)
  if (!key) throw new Error(`Unable to find signing key with kid=${signingKid}`)
  return key
}

export const getVerificationPublicKeyFromJwks = (): string => {
  const verificationKid = 'verification-09305bf4-b4da-469b-b502-afe318ac2a18'
  const key = getKeyFromJwks(verificationKid, cachedJwks)
  if (!key)
    throw new Error(
      `Unable to find verification key with kid=${verificationKid}`
    )
  return key
}

// Example function to help create JWKS entries
// export const createEd25519JwksKey = (
//   kid: string,
//   base64Key: string
// ): JwksKey => {
//   return {
//     kty: 'OKP',
//     kid,
//     use: 'sig',
//     alg: 'EdDSA',
//     crv: 'Ed25519',
//     x: toBase64Url(base64Key),
//   }
// }

// // Example function to help create EC JWKS keys
// export const createEcJwksKey = (
//   kid: string,
//   x: string,
//   y: string,
//   curve: 'P-256' | 'P-384' | 'P-521' = 'P-256'
// ): JwksKey => {
//   return {
//     kty: 'EC',
//     kid,
//     use: 'sig',
//     alg: 'ES256',
//     crv: curve,
//     x: toBase64Url(x),
//     y: toBase64Url(y),
//   }
// }

/**
 * Example usage:
 * const key = createEd25519JwksKey(
 *   'signing-key-1',
 *   'rjv41kYqZwcbe3r6ymMEEKQ+Vd+DPuogN+Gzq3lP2Og='
 * )
 * // Result:
 * // {
 * //   kty: 'OKP',
 * //   kid: 'signing-key-1',
 * //   use: 'sig',
 * //   alg: 'EdDSA',
 * //   crv: 'Ed25519',
 * //   x: 'rjv41kYqZwcbe3r6ymMEEKQ-Vd-DPuogN-Gzq3lP2Og'
 * // }
 */

/**
 * Note: Ed25519 is a specific Edwards curve designed for digital signatures
 * while EC keys typically use NIST curves like P-256. They have different
 * characteristics and security properties.
 */
