import * as url from 'url'

import { sign } from './util/signature'
import { parseSignatureHeader } from './util/parser'
import { isSignatureHeaderValid, hasEpochExpired } from './util/webhooks'
import { MissingSecretKeyError, WebhookAuthenticateError } from './errors'

export default class Webhooks {
  publicKey: string
  secretKey?: string

  constructor({
    publicKey,
    secretKey,
  }: {
    publicKey: string
    secretKey?: string
  }) {
    this.publicKey = publicKey
    this.secretKey = secretKey
  }

  /**
   * Injects the webhook public key for authentication
   * @param header X-FormSG-Signature header
   * @param uri The endpoint that FormSG is POSTing to
   * @returns true if the header is verified
   * @throws {Error} If the signature or uri cannot be verified
   */
  authenticate = (header: string, uri: string) => {
    // Parse the header
    const signatureHeader = parseSignatureHeader(header)
    const {
      v1: signature,
      t: epoch,
      s: submissionId,
      f: formId,
    } = signatureHeader

    if (!epoch || !signature || !submissionId || !formId) {
      throw new WebhookAuthenticateError('X-FormSG-Signature header is invalid')
    }

    // Verify signature authenticity
    if (!isSignatureHeaderValid(uri, signatureHeader, this.publicKey)) {
      throw new WebhookAuthenticateError(
        `Signature could not be verified for uri=${uri} submissionId=${submissionId} formId=${formId} epoch=${epoch} signature=${signature}`
      )
    }

    // Verify epoch recency
    if (hasEpochExpired(epoch)) {
      throw new WebhookAuthenticateError(
        `Signature is not recent for uri=${uri} submissionId=${submissionId} formId=${formId} epoch=${epoch} signature=${signature}`
      )
    }

    // All checks pass.
    return true
  }

  /**
   * Generates a signature based on the URI, submission ID and epoch timestamp.
   * @param params The parameters needed to generate the signature
   * @param params.uri Full URL of the request
   * @param params.submissionId Submission Mongo ObjectId saved to the database
   * @param params.epoch Number of milliseconds since Jan 1, 1970
   * @returns the generated signature
   * @throws {MissingSecretKeyError} if a secret key is not provided when instantiating this class
   */
  generateSignature = ({
    uri,
    submissionId,
    formId,
    epoch,
  }: {
    uri: string
    submissionId: Object
    formId: string
    epoch: number
  }) => {
    if (!this.secretKey) {
      throw new MissingSecretKeyError()
    }

    const baseString = `${
      url.parse(uri).href
    }.${submissionId}.${formId}.${epoch}`
    return sign(baseString, this.secretKey)
  }

  /**
   * Constructs the `X-FormSG-Signature` header
   * @param params The parameters needed to construct the header
   * @param params.epoch Epoch timestamp
   * @param params.submissionId Mongo ObjectId
   * @param params.formId Mongo ObjectId
   * @param params.signature A signature generated by the generateSignature() function
   * @returns The `X-FormSG-Signature` header
   * @throws {Error} if a secret key is not provided when instantiating this class
   */
  constructHeader = ({
    epoch,
    submissionId,
    formId,
    signature,
  }: {
    epoch: number
    submissionId: string
    formId: string
    signature: string
  }) => {
    if (!this.secretKey) {
      throw new MissingSecretKeyError()
    }

    return `t=${epoch},s=${submissionId},f=${formId},v1=${signature}`
  }
}
