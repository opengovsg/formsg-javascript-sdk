import nacl from 'tweetnacl'
import { decodeUTF8, decodeBase64, encodeBase64 } from 'tweetnacl-util'
import basestring from './basestring'
export default function (privateKey: string){
    
  function generateSignature({ transactionId, formId, fieldId, answer }: {
        transactionId: string; formId: string; fieldId: string; answer: string;
    }): string {
    const time = Date.now()
    const data = basestring({ transactionId, formId, fieldId, answer, time })
    const signature = nacl.sign.detached(
      decodeUTF8(data),
      decodeBase64(privateKey)
    )
    return `f=${formId},v=${transactionId},t=${time},s=${encodeBase64(signature)}`
  }

  return generateSignature
}
