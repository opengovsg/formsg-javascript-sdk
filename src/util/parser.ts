// The constituents of the X-FormSG-Signature
export type Signature = {
  // The ed25519 signature
  v1: string
  // The epoch used for signing, number of milliseconds since Jan 1, 1970
  t: number
  // The submission ID, usually the MongoDB submission ObjectId
  s: string
  // The form ID, usually the MongoDB form ObjectId
  f: string
}

/**
 * Parses the X-FormSG-Signature header into its constitutents
 * @param header The X-FormSG-Signature header
 * @returns The signature header
 */
function parseSignatureHeader(header: string): Signature {
  const parsedSignature = header
    .split(',')
    .map((kv) => kv.split(/=(.*)/))
    .reduce((acc, [k, v]) => {
      acc[k] = v
      return acc
    }, {} as Record<string, any>)

  parsedSignature.t = Number(parsedSignature.t)

  return parsedSignature as Signature
}

export { parseSignatureHeader }
