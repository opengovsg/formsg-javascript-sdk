import { JwksConfig, PackageMode } from '../types'

import {
  getSigningPublicKeyFromJwks,
  getVerificationPublicKeyFromJwks,
  initJwks,
} from './jwks'
import { getSigningPublicKey, getVerificationPublicKey } from './publicKey'

export const getPublicKeys = async (jwks?: JwksConfig, mode?: PackageMode) => {
  if (jwks?.url) {
    await initJwks(jwks)
  }

  return {
    signingPublicKey: async () => {
      if (jwks?.url) {
        try {
          return await getSigningPublicKeyFromJwks()
        } catch (error) {
          console.warn('Failed to get signing key from JWKS:', error)
        }
      }
      return getSigningPublicKey(mode)
    },
    verificationPublicKey: async () => {
      if (jwks?.url) {
        try {
          return await getVerificationPublicKeyFromJwks()
        } catch (error) {
          console.warn('Failed to get verification key from JWKS:', error)
        }
      }
      return getVerificationPublicKey(mode)
    },
  }
}
