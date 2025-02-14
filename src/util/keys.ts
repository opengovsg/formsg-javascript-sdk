import { JwksConfig, PackageMode } from '../types'

import {
  fetchJwks,
  getSigningPublicKeyFromJwks,
  getVerificationPublicKeyFromJwks,
} from './jwks'
import {
  getSigningPublicKey,
  getVerificationPublicKey,
  initKeyCaches,
} from './publicKey'

export async function getPublicKeys(jwks?: JwksConfig, mode?: PackageMode) {
  initKeyCaches(jwks)

  if (!jwks?.url) {
    return {
      signingPublicKey: () => getSigningPublicKey(mode),
      verificationPublicKey: () => getVerificationPublicKey(mode),
    }
  }

  try {
    await fetchJwks(jwks)
    return {
      signingPublicKey: () => getSigningPublicKeyFromJwks(),
      verificationPublicKey: () => getVerificationPublicKeyFromJwks(),
    }
  } catch (error) {
    console.warn('Falling back to static public keys:', error)
    return {
      signingPublicKey: () => getSigningPublicKey(mode),
      verificationPublicKey: () => getVerificationPublicKey(mode),
    }
  }
}
