import { generateKeypair } from './util/crypto'

export default class CryptoBase {
  /**
   * Generates a new keypair for encryption.
   * @returns The generated keypair.
   */
  generate = generateKeypair
}
