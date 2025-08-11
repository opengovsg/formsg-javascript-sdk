// Safe max value to avoid floating point precision issues (Number.MAX_SAFE_INTEGER = 9007199254740991)
export const DEFAULT_JWKS_CACHE_DURATION_MS = 3_600_000 // 1 hour
export const DEFAULT_JWKS_TIMEOUT_MS = 5_000
export const MAX_CACHE_DURATION_MS = 86_400_000 // 24 hours, current upper bound

// JWKS retry configuration
export const JWKS_MAX_RETRIES = 3
export const JWKS_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]
export const JWKS_INITIAL_BACKOFF_MS = 1000 // Initial backoff period for exponential delay
