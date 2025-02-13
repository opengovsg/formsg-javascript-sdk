import { PackageMode } from '../types'

import {
  fetchJwks,
  getSigningPublicKeyFromJwks,
  getVerificationPublicKeyFromJwks,
} from './jwks'
import { getSigningPublicKey, getVerificationPublicKey } from './publicKey'

export async function getPublicKeys(jwksUrl?: string, mode?: PackageMode) {
  if (!jwksUrl) {
    return {
      signingPublicKey: getSigningPublicKey(mode),
      verificationPublicKey: getVerificationPublicKey(mode),
    }
  }

  try {
    await fetchJwks(jwksUrl)
    return {
      signingPublicKey: getSigningPublicKeyFromJwks(),
      verificationPublicKey: getVerificationPublicKeyFromJwks(),
    }
  } catch (error) {
    console.warn('Falling back to static public keys:', error)
    return {
      signingPublicKey: getSigningPublicKey(mode),
      verificationPublicKey: getVerificationPublicKey(mode),
    }
  }
}
