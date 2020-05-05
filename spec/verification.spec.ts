import { VERIFICATION_KEYS } from '../src/resource/verification-keys'
import getPublicKey from '../src/verification/get-public-key'
import basestring from '../src/verification/basestring'
import formsgPackage from '../src/index'

describe('Verification', function (){
   
  describe('Initialization', function (){
    it('should not generate signatures if secret key is not provided', function (){
      const formsg = formsgPackage({
        mode: 'test', 
        verificationOptions: {
          transactionExpiry: 10000,
        },
      })
      expect(formsg.verification.generateSignature).toThrow()
    })
    it('should not authenticate if transaction expiry is not provided', function (){
      const formsg = formsgPackage({
        mode: 'test', 
        verificationOptions: {
          secretKey: VERIFICATION_KEYS.test.secretKey,
        },
      })
      expect(formsg.verification.authenticate).toThrow()    
    })
  })

  describe('Usage', function (){
    const TRANSACTION_EXPIRY = 10000
    const TIME = 1588658696255
    const VALID_SIGNATURE = `f=formId,v=transactionId,t=${TIME},s=XLF1V4RDu8dEJLq1yK3UN92TwiekVoif7PX4V8cXr5ERfIQXlOcO+ZOFAawawKWhFSqScg5z1Ro+Y+bMeNmRAg==`
    const INVALID_SIGNATURE = `f=formId,v=transactionId,t=${TIME},s=InvalidSignatureyK3UN92TwiekVoif7PX4V8cXr5ERfIQXlOcO+ZOFAawawKWhFSqScg5z1Ro+Y+bMeNmRAg==`
    const PARAMS = {
      transactionId: 'transactionId', 
      formId: 'formId', 
      fieldId: 'fieldId', 
      answer: 'answer', 
    }
    const formsg = formsgPackage({
      mode: 'test', 
      verificationOptions: {
        transactionExpiry: TRANSACTION_EXPIRY,
        secretKey: VERIFICATION_KEYS.test.secretKey,
      },
    })
    let now: jest.MockInstance<number,any>  | null
    beforeAll(function (){
        now = jest.spyOn(Date, 'now').mockImplementation(function (){ return TIME })
    })
    afterAll(function (){
        now!.mockRestore()
    })
    it('should get the correct key given a mode', function (){
      expect(getPublicKey('test')).toBe(VERIFICATION_KEYS.test.publicKey)
      expect(getPublicKey('staging')).toBe(VERIFICATION_KEYS.staging.publicKey)
      expect(getPublicKey('development')).toBe(VERIFICATION_KEYS.development.publicKey)
      expect(getPublicKey('production')).toBe(VERIFICATION_KEYS.production.publicKey)
      expect(getPublicKey()).toBe(VERIFICATION_KEYS.production.publicKey)
    })
    it('should construct a basestring', function (){
      expect(basestring({
        time: TIME,   
        ...PARAMS,
      })).toBe(`transactionId.formId.fieldId.answer.${TIME}`)
    })
    it('should generate a signature', function (){
      expect(formsg.verification.generateSignature!(PARAMS))
        .toBe(VALID_SIGNATURE)
    })
    it('should successfully authenticate a valid signature', function (){
      const payload = {
        signatureString: VALID_SIGNATURE,
        submissionCreatedAt: TIME+1,
        fieldId: PARAMS.fieldId,
        answer: PARAMS.answer,
      }
      expect(formsg.verification.authenticate!(payload)).toBe(true)
            
    })
    it('should fail to authenticate a valid signature if it is expired', function (){
      const payload = {
        signatureString: VALID_SIGNATURE,
        submissionCreatedAt: TIME + TRANSACTION_EXPIRY*2000,
        fieldId: PARAMS.fieldId,
        answer: PARAMS.answer,
      }
      expect(formsg.verification.authenticate!(payload)).toBe(false)
            
    })
    it('should fail to authenticate an invalid signature', function (){
      const payload = {
        signatureString: INVALID_SIGNATURE,
        submissionCreatedAt: TIME+1,
        fieldId: PARAMS.fieldId,
        answer: PARAMS.answer,
      }
      expect(formsg.verification.authenticate!(payload)).toBe(false)
    })
  })
   
})