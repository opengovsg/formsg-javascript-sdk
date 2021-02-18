export type PackageInitParams = {
  webhookSecretKey?: string
  verificationOptions?: VerificationOptions
} & (
  | {
      signingPublicKey?: string
      /** @deprecated Please switch to using the `signingPublicKey` and `verificationOptions.publicKey` parameters instead. Deprecated since January 2021. */
      mode?: never
    }
  | {
      signingPublicKey?: never
      /** @deprecated Please switch to using the `signingPublicKey` and `verificationOptions.publicKey` parameters instead. Deprecated since January 2021. */
      mode?: PackageMode
    }
)

// A field type available in FormSG as a string
export type FieldType =
  | 'section'
  | 'radiobutton'
  | 'dropdown'
  | 'checkbox'
  | 'nric'
  | 'email'
  | 'table'
  | 'number'
  | 'rating'
  | 'yes_no'
  | 'decimal'
  | 'textfield' // Short Text
  | 'textarea' // Long Text
  | 'attachment'
  | 'date'
  | 'mobile'
  | 'homeno'

// Represents form field responses in a form.
export type FormField = {
  _id: string
  question: string
  fieldType: FieldType
  isHeader?: boolean
  signature?: string
} & (
  | { answer: string; answerArray?: never }
  | { answer?: never; answerArray: string[] | string[][] }
)

// Encrypted basestring containing the submission public key,
// nonce and encrypted data in base-64.
// A string in the format of
// <SubmissionPublicKey>;<Base64Nonce>:<Base64EncryptedData>
export type EncryptedContent = string

export interface DecryptParams {
  encryptedContent: EncryptedContent
  version: number
  verifiedContent?: EncryptedContent
}

export type DecryptedContent = {
  responses: FormField[]
  verified?: Record<string, any>
}

export type EncryptedFileContent = {
  submissionPublicKey: string
  nonce: string
  binary: Uint8Array
}

// A base-64 encoded cryptographic keypair suitable for curve25519.
export type Keypair = {
  publicKey: string
  secretKey: string
}

export type PackageMode = 'staging' | 'production' | 'development' | 'test'

export type VerificationOptions = {
  publicKey?: string
  secretKey?: string
  transactionExpiry?: number
}

// A verified answer contains a field ID and answer
export type VerifiedAnswer = {
  fieldId: string
  answer: string
}

// Add the transaction ID and form ID to a VerifiedAnswer to obtain a signature
export type VerificationSignatureOptions = VerifiedAnswer & {
  transactionId: string
  formId: string
}

// Creating a basestring requires the epoch in addition to signature requirements
export type VerificationBasestringOptions = VerificationSignatureOptions & {
  time: number
}

// Authenticate a VerifiedAnswer with a signatureString and epoch
export type VerificationAuthenticateOptions = VerifiedAnswer & {
  signatureString: string
  submissionCreatedAt: number
}
