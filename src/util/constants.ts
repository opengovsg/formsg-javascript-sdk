// Safe max value to avoid floating point precision issues (Number.MAX_SAFE_INTEGER = 9007199254740991)
export const DEFAULT_JWKS_CACHE_DURATION_MS = 3_600_000 // 1 hour
export const DEFAULT_JWKS_TIMEOUT_MS = 5_000
export const MAX_CACHE_DURATION_MS = 86_400_000 // 24 hours, current upper bound
export const DEFAULT_MAX_RETRIES = 3
export const DEFAULT_INITIAL_RETRY_DELAY_MS = 100 // 100ms
export const DEFAULT_MAX_RETRY_DELAY_MS = 1000 // 1 second
export const DEFAULT_BACKOFF_MULTIPLIER = 2 // Double the delay after each retry
