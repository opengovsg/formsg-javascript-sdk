const _ = require('lodash')

const formsg = require('../index')()

const {
  plaintext,
  ciphertext,
  formSecretKey,
  formPublicKey,
} = require('./resources/crypto-data-20200322')

describe('Crypto', function () {

  it('should generate a keypair', () => {
    const keypair = formsg.crypto.generate()
    expect(Object.keys(keypair)).toContain('secretKey')
    expect(Object.keys(keypair)).toContain('publicKey')
  })

  it('should generate a keypair that is valid', () => {
    const { publicKey, secretKey } = formsg.crypto.generate()
    expect(formsg.crypto.valid(publicKey, secretKey)).toBe(true)
  })

  it('should validate an existing keypair', () => {
    expect(formsg.crypto.valid(formPublicKey, formSecretKey)).toBe(true)
  })

  it('should invalidate unassociated keypairs', () => {
    const { secretKey } = formsg.crypto.generate()
    const { publicKey } = formsg.crypto.generate()
    expect(formsg.crypto.valid(
      publicKey,
      secretKey,
    )).toBe(false)
  })

  it('should decrypt the submission ciphertext from 2020-03-22 successfully', () => {
    const decryptedPlaintext = formsg.crypto.decrypt(formSecretKey, ciphertext)
    expect(_.isEqual(decryptedPlaintext, plaintext)).toBe(true)
  })

  it('should return null on unsuccessful decryption', () => {
    expect(formsg.crypto.decrypt('random', ciphertext)).toBe(null)
  })

  it('should be able to encrypt and decrypt submissions from 2020-03-22 end-to-end successfully', () => {
    const { publicKey, secretKey } = formsg.crypto.generate()
    const ciphertext = formsg.crypto.encrypt(publicKey, plaintext)
    const decrypted = formsg.crypto.decrypt(secretKey, ciphertext)
    expect(_.isEqual(decrypted, plaintext)).toBe(true)
  })
})
