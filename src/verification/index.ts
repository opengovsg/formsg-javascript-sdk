/**
 * @file Manages verification of otp form fields (email, sms, whatsapp)
 * @author Jean Tan
 */
import { PackageInitParams } from '../types'

import authenticate from './authenticate'
import generateSignature from './generate-signature'
import getPublicKey from './get-public-key'

/**
 * Provider that accepts configuration
 * before returning the webhooks module
 */
export = function ({
  mode,
  verificationOptions,
  publicKey,
}: PackageInitParams) {
  if (verificationOptions !== undefined) {
    const verificationPublicKey =
      publicKey || getPublicKey(mode || 'production')
    const {
      secretKey: verificationSecretKey,
      transactionExpiry,
    } = verificationOptions
    return {
      authenticate:
        transactionExpiry !== undefined
          ? authenticate(verificationPublicKey, transactionExpiry)
          : function () {
              throw new Error(
                'Provide transactionExpiry when initializing the formsg sdk to use this function.'
              )
            },
      generateSignature:
        verificationSecretKey !== undefined
          ? generateSignature(verificationSecretKey)
          : function () {
              throw new Error(
                'Provide verificationSecretKey when initializing the formsg sdk to use this function.'
              )
            },
    }
  }
  return {}
}
