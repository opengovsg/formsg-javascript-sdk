export const MOCK_JWKS_URL = 'https://test.example.com/.well-known/jwks.json'

export const MOCK_JWKS_RESPONSE = {
  keys: [
    {
      kty: 'OKP',
      kid: '1-old-key',
      use: 'sig',
      alg: 'EdDSA',
      crv: 'Ed25519',
      x: 'abc-123_test', // base64url which should be converted to base64
    },
    {
      kty: 'OKP',
      kid: '2-old-key',
      use: 'verify',
      alg: 'EdDSA',
      crv: 'Ed25519',
      x: 'def-456_test',
    },
    {
      kty: 'OKP',
      kid: 'some-new-key-id',
      use: 'sig',
      alg: 'EdDSA',
      crv: 'Ed25519',
      x: 'abc-789_test',
    },
  ],
}
