
/**
 * Formats given data into a string for signing
 */
function constructHeader(
  { transactionId, formId, fieldId, answer, time }: 
    { transactionId: string; formId: string; fieldId: string; answer: string; time: number }
): string {
  return `${transactionId}.${formId}.${fieldId}.${answer}.${time}`
}
  
export default constructHeader