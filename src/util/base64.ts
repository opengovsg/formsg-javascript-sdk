/**
 * base64 to base64url magic
 * - Replaces + with -
 * - Replaces / with _
 * - Removes padding (=)
 */
export const toBase64Url = (base64: string): string => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Example:
 * const base64 = 'rjv41kYqZwcbe3r6ymMEEKQ+Vd+DPuogN+Gzq3lP2Og='
 * const base64url = toBase64Url(base64)
 * // Result: 'rjv41kYqZwcbe3r6ymMEEKQ-Vd-DPuogN-Gzq3lP2Og'
 */
