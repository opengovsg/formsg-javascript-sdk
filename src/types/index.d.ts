type PackageInitParams = {
  mode?: PackageMode
  webhookSecretKey?: string
}

// A field type available in FormSG as a string
type FieldType =
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

// Represents form field responses in a form.
type FormField = {
  _id: string
  question: string
  fieldType: FieldType
  isHeader?: boolean
  signature?: string
} & (
  | { answer: string; answerArray?: never }
  | { answer?: never; answerArray: string[] }
)

// Encrypted basestring containing the submission public key,
// nonce and encrypted data in base-64.
// A string in the format of
// <SubmissionPublicKey>;<Base64Nonce>:<Base64EncryptedData>
type EncryptedContent = string

type DecryptedContent = {
  responses: FormField[]
  verified?: Record<string, any>
}

type EncryptedFileContent = {
  submissionPublicKey: string
  nonce: string
  binary: Uint8Array
}

// A base-64 encoded cryptographic keypair suitable for curve25519.
type Keypair = {
  publicKey: string
  secretKey: string
}

type PackageMode = 'staging' | 'production' | 'development' | 'test'
