/**
 * @file Manages verification of otp form fields (email, sms, whatsapp)
 * @author Jean Tan 
 */

import authenticate from './authenticate'
import generateSignature from './generate-signature'
import getPublicKey from './get-public-key'

/**
 * Provider that accepts configuration
 * before returning the webhooks module
 */
export = function (params: PackageInitParams = {}) {
  const { mode, verificationOptions } = params
  if(verificationOptions !== undefined){
    const { secretKey: verificationSecretKey, transactionExpiry } = verificationOptions
    if(verificationSecretKey === undefined || transactionExpiry === undefined){
      throw new Error('Both secretKey and transactionExpiry must be specified for verification of otp form fields')
    }

    const verificationPublicKey = getPublicKey(mode)
      
    return {
      /* Verification functions */
      authenticate: authenticate(verificationPublicKey, transactionExpiry),
      /* Signing functions */
      /* Return noop if a verificationSecretKey is not provided. */
      generateSignature: verificationSecretKey
        ? generateSignature(verificationSecretKey)
        : function () {},
    }
  }
  return {
    authenticate: function (){},
    generateSignature: function (){},
  } 
}
  