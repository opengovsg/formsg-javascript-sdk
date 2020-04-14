import { SIGNING_KEYS } from '../resource/signing-keys'
import STAGE from './stage'

/**
 * Retrieves the appropriate public key.
 * Defaults to production.
 * @param mode The package mode to retrieve the public key for.
 */
function getPublicKey(mode?: PackageMode) {
  switch (mode) {
    case STAGE.development:
    case STAGE.staging:
      return SIGNING_KEYS.staging.publicKey
    case STAGE.test:
      return SIGNING_KEYS.test.publicKey
    default:
      return SIGNING_KEYS.production.publicKey
  }
}

export { getPublicKey }
