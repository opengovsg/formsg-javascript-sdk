import { SIGNING_KEYS } from '../resource/signing-keys'
import { VERIFICATION_KEYS } from '../resource/verification-keys'
import { JwksConfig, PackageMode } from '../types'

import { Cache } from './cache'
import { DEFAULT_JWKS_CACHE_DURATION_MS } from './constants'
import STAGE from './stage'

const createKeyCache = (config?: JwksConfig) => {
  const duration = config?.cacheDurationMs ?? DEFAULT_JWKS_CACHE_DURATION_MS
  return new Cache<string>(duration)
}

let signingKeyCache: Cache<string>
let verificationKeyCache: Cache<string>

export function initKeyCaches(config?: JwksConfig) {
  signingKeyCache = createKeyCache(config)
  verificationKeyCache = createKeyCache(config)
}

/**
 * Gets the signing public key with caching
 */
export function getSigningPublicKey(mode?: PackageMode): string {
  const cached = signingKeyCache.get()
  if (cached) return cached

  const key = (() => {
    switch (mode) {
      case STAGE.development:
        return SIGNING_KEYS.development.publicKey
      case STAGE.staging:
        return SIGNING_KEYS.staging.publicKey
      case STAGE.test:
        return SIGNING_KEYS.test.publicKey
      default:
        return SIGNING_KEYS.production.publicKey
    }
  })()

  signingKeyCache.set(key)
  return key
}

/**
 * Gets the verification public key with caching
 */
export function getVerificationPublicKey(mode?: PackageMode): string {
  const cached = verificationKeyCache.get()
  if (cached) return cached

  const key = (() => {
    switch (mode) {
      case STAGE.development:
        return VERIFICATION_KEYS.development.publicKey
      case STAGE.staging:
        return VERIFICATION_KEYS.staging.publicKey
      case STAGE.test:
        return VERIFICATION_KEYS.test.publicKey
      default:
        return VERIFICATION_KEYS.production.publicKey
    }
  })()

  verificationKeyCache.set(key)
  return key
}
