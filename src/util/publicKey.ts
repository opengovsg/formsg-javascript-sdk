import { SIGNING_KEYS } from '../resource/signing-keys'
import { VERIFICATION_KEYS } from '../resource/verification-keys'
import { PackageMode } from '../types'

import STAGE from './stage'

/**
 * Gets the signing public key
 */
export const getSigningPublicKey = (mode?: PackageMode): string => {
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
}

/**
 * Gets the verification public key
 */
export const getVerificationPublicKey = (mode?: PackageMode): string => {
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
}
