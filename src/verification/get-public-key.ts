import { VERIFICATION_KEYS } from '../resource/verification-keys'
import STAGE from '../util/stage'

/**
 * Retrieves the appropriate public key.
 * Defaults to production.
 * @param mode The package mode to retrieve the public key for.
 */
function getPublicKey(mode?: PackageMode) {
  switch (mode) {
  case STAGE.development:
  case STAGE.staging:
    return VERIFICATION_KEYS.staging.publicKey
  case STAGE.test:
    return VERIFICATION_KEYS.test.publicKey
  default:
    return VERIFICATION_KEYS.production.publicKey
  }
}

export default getPublicKey
