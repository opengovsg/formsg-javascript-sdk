// Safe max value to avoid floating point precision issues (Number.MAX_SAFE_INTEGER = 9007199254740991)
export const DEFAULT_JWKS_CACHE_DURATION_MS = 3_600_000 // 1 hour
export const DEFAULT_JWKS_TIMEOUT_MS = 5_000 // 5 seconds
export const MAX_CACHE_DURATION_MS = 86_400_000 // 24 hours, current upper bound
