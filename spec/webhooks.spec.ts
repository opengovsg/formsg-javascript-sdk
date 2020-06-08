import Webhooks from '../src/webhooks'
import { SIGNING_KEYS } from '../src/resource/signing-keys'
import { MissingSecretKeyError, WebhookAuthenticateError } from '../src/errors'

const webhooksPublicKey = SIGNING_KEYS.test.publicKey
const signingSecretKey = SIGNING_KEYS.test.secretKey

describe('Webhooks', () => {
  const uri = 'https://some-endpoint.com/post'
  const submissionId = 'someSubmissionId'
  const formId = 'someFormId'

  const webhooks = new Webhooks({
    publicKey: webhooksPublicKey,
    secretKey: signingSecretKey,
  })

  const webhooksNoSecret = new Webhooks({
    publicKey: webhooksPublicKey,
  })

  /**
   * Helper method to generate a test signature.
   */
  const generateTestSignature = (epoch: number) => {
    return webhooks.generateSignature({
      uri,
      submissionId,
      formId,
      epoch,
    })
  }

  /**
   * Helper method to construct a test header.
   */
  const constructTestHeader = (epoch: number, signature: string) => {
    return webhooks.constructHeader({
      epoch,
      submissionId,
      formId,
      signature,
    })
  }

  it('should be signing the signature and generating the X-FormSG-Signature header with the correct format', () => {
    const epoch = 1583136171649
    const signature = generateTestSignature(epoch)
    expect(signature).toBe(
      'KMirkrGJLPqu+Na+gdZLUxl9ZDgf2PnNGPnSoG1FuTMRUTiQ6o0jB/GTj1XFjn2s9JtsL5GiCmYROpjJhDyxCw=='
    )

    // X-FormSG-Signature
    const header = constructTestHeader(epoch, signature)
    expect(header).toBe(
      `t=1583136171649,s=someSubmissionId,f=someFormId,v1=KMirkrGJLPqu+Na+gdZLUxl9ZDgf2PnNGPnSoG1FuTMRUTiQ6o0jB/GTj1XFjn2s9JtsL5GiCmYROpjJhDyxCw==`
    )
  })

  it('should authenticate a signature that was recently generated', () => {
    const epoch = Date.now()
    const signature = generateTestSignature(epoch)
    const header = constructTestHeader(epoch, signature)

    const authentiateResult = webhooks.authenticate(header, uri)
    expect(authentiateResult).toBe(true)
  })

  it('should reject signatures generated more than 5 minutes ago', () => {
    const epoch = Date.now() - 5 * 60 * 1000 - 1
    const signature = generateTestSignature(epoch)
    const header = constructTestHeader(epoch, signature)

    expect(() => webhooks.authenticate(header, uri)).toThrow(
      WebhookAuthenticateError
    )
  })

  it('should reject invalid signature headers', () => {
    const invalidHeader = 'invalidHeader'
    expect(() => webhooks.authenticate(invalidHeader, uri)).toThrow(
      WebhookAuthenticateError
    )
  })

  it('should reject if signature header cannot be verified', () => {
    // Create valid header
    const epoch = Date.now()
    const signature = generateTestSignature(epoch)
    const header = constructTestHeader(epoch, signature)

    // Create a new Webhook class with a different publicKey
    const webhooksAlt = new Webhooks({
      publicKey: 'ReObXacwevg7CaNtg5QwvtW32S0V6md15up4szRdWUY=',
    })

    expect(() => webhooksAlt.authenticate(header, uri)).toThrow(
      WebhookAuthenticateError
    )
  })

  it('should throw error if generateSignature is called without a secret key in class instantiation', () => {
    expect(() =>
      webhooksNoSecret.generateSignature({
        uri,
        submissionId,
        formId,
        epoch: Date.now(),
      })
    ).toThrow(MissingSecretKeyError)
  })

  it('should throw error if constructHeader is called without a secret key in class instantiation', () => {
    const testEpoch = Date.now()
    const validSignature = generateTestSignature(testEpoch)

    expect(() =>
      webhooksNoSecret.constructHeader({
        formId,
        submissionId,
        epoch: testEpoch,
        signature: validSignature,
      })
    ).toThrow(MissingSecretKeyError)
  })
})
