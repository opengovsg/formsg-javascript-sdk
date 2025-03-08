import { JwksConfig, PackageMode } from '../types'

import {
  getSigningPublicKeysFromJwks,
  getVerificationPublicKeysFromJwks,
  initJwks,
} from './jwks'
import { getSigningPublicKey, getVerificationPublicKey } from './publicKey'

export const getPublicKeys = async (
  jwks?: JwksConfig,
  webhookPublicKey?: string,
  verificationPublicKey?: string,
  mode?: PackageMode
): Promise<{
  signingPublicKeys: (keyId?: string) => Promise<string[]>
  verificationPublicKeys: (keyId?: string) => Promise<string[]>
}> => {
  if (jwks?.url) {
    await initJwks(jwks)
  }

  return {
    signingPublicKeys: async (keyId?: string) => {
      if (jwks?.url) {
        try {
          return await getSigningPublicKeysFromJwks(keyId)
        } catch (error) {
          console.warn('Failed to get signing key from JWKS:', error)
        }
      }

      if (webhookPublicKey) {
        return [webhookPublicKey]
      }

      return [getSigningPublicKey(mode)]
    },
    verificationPublicKeys: async (keyId?: string) => {
      if (jwks?.url) {
        try {
          return await getVerificationPublicKeysFromJwks(keyId)
        } catch (error) {
          console.warn('Failed to get verification key from JWKS:', error)
        }
      }

      if (verificationPublicKey) {
        return [verificationPublicKey]
      }

      return [getVerificationPublicKey(mode)]
    },
  }
}
