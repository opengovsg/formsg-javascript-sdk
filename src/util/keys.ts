import { JwksConfig, PackageMode } from '../types'

import {
  getSigningPublicKeysFromJwks,
  getVerificationPublicKeysFromJwks,
  initJwks,
} from './jwks'
import { getSigningPublicKey, getVerificationPublicKey } from './publicKey'

export const getPublicKeys = async (
  jwks?: JwksConfig,
  mode?: PackageMode
): Promise<{
  signingPublicKeys: () => Promise<string[]>
  verificationPublicKeys: () => Promise<string[]>
}> => {
  if (jwks?.url) {
    await initJwks(jwks)
  }

  return {
    signingPublicKeys: async () => {
      if (jwks?.url) {
        try {
          return await getSigningPublicKeysFromJwks()
        } catch (error) {
          console.warn('Failed to get signing key from JWKS:', error)
        }
      }
      return [getSigningPublicKey(mode)]
    },
    verificationPublicKeys: async () => {
      if (jwks?.url) {
        try {
          return await getVerificationPublicKeysFromJwks()
        } catch (error) {
          console.warn('Failed to get verification key from JWKS:', error)
        }
      }
      return [getVerificationPublicKey(mode)]
    },
  }
}
