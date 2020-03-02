

const url = require('url')

const { verify } = require('./util/signature')
const { parseSignatureHeader } = require('../src/util/parser')
const WEBHOOK_KEYS = require('../resource/webhook-keys')
const STAGE = require('./util/stage')

/**
 * Helpfer function to construct the basestring and verify the signature of an incoming request
 * @param {string} uri String
 * @param {string} submissionId MongoDB submission ObjectId
 * @param {string} formId MongoDB submission ObjectId
 * @param {Number} epoch Number of milliseconds since Jan 1, 1970
 * @param {string} signature base64 encoded signature 
 * @param {string} webhookPublicKey base64 webhook public key
 */
function verifySignature (uri, submissionId, formId, epoch, signature, webhookPublicKey) {
  const baseString = `${url.parse(uri).href}.${submissionId}.${formId}.${epoch}`
  return verify(baseString, signature, webhookPublicKey)
}

/**
 * Helper function to verify that the epoch submitted is recent.
 * Prevents against replay attacks.
 * @param {Number} epoch The number of milliseconds since Jan 1, 1979
 * @param {Number} [expiry=30000] Duration of expiry. The default is 5 minutes.
 */
function verifyEpoch (epoch, expiry=300000) {
  const difference = Date.now() - epoch
  return difference > 0 && difference < expiry
}

/**
 * Partial function that injects the webhook public key for authentication
 * @param {string} webhookPublicKey The FormSG webhook public key
 * @param {string} header X-FormSG-Signature header
 * @param {string} uri The endpoint that FormSG is POSTing to
 * @returns {function}
 * @throws {Error} If the signature or uri cannot be verified
 */
const authenticate = webhookPublicKey => (header, uri) => {

  // Parse the header
  const { v1: signature, t, s: submissionId, f: formId } =
    parseSignatureHeader(header)
  const epoch = Number(t)

  if (!epoch || !signature || !submissionId || !formId) {
    throw new Error('X-FormSG-Signature header is invalid')
  }

  // Verify signature authenticity
  if (!verifySignature(uri, submissionId, formId, epoch, signature, webhookPublicKey)) {
    throw new Error(`Signature could not be verified for uri=${uri} submissionId=${submissionId} formId=${formId} epoch=${epoch} signature=${signature}`)
  }

  // Verify epoch recency
  if (!verifyEpoch(epoch)) {
    throw new Error(`Signature is not recent for uri=${uri} submissionId=${submissionId} formId=${formId} epoch=${epoch} signature=${signature}`)
  }
}

/**
 * Retrieves the appropriate webhook public key.
 * Defaults to production.
 * @param {string} [mode] One of 'staging' | 'production'
 */
function getWebhookPublicKey (mode) {
  switch (mode) {
    case STAGE.staging:
      return WEBHOOK_KEYS.staging.publicKey
    case STAGE.test:
      return WEBHOOK_KEYS.test.publicKey
    default:
      return WEBHOOK_KEYS.production.publicKey
  }
}

/**
 * Provider that accepts configuration
 * before returning the webhooks module
 */
module.exports = function ({ mode }) {
  const webhookPublicKey = getWebhookPublicKey(mode)

  return {
    authenticate: authenticate(webhookPublicKey)
  }
}
