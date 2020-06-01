import { VerificationBasestringOptions } from '../types'

/**
 * Formats given data into a string for signing
 */
function basestring({
  transactionId,
  formId,
  fieldId,
  answer,
  time,
}: VerificationBasestringOptions): string {
  return `${transactionId}.${formId}.${fieldId}.${answer}.${time}`
}

export default basestring
