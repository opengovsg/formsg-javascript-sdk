# Migration Guide for FormSG SDK from 0.x.x to 1.0.0

## Major Changes Regarding Public Keys
Prior to version 1.0.0, **all signing keys are hardcoded in the SDK**.
Making the SDK convenient to use, but with poor security posture in case of a key compromise.

With hardcoded keys, key rotation involves changing the hardcoded keys, publish a new patch version, and tell all clients using our SDK to urgently update to that new version.

**Anyway, why does rotating keys matter?**
1. **Limiting exposure after compromise**: If a private key is compromised, having a rotation process ensures the exposure window is limited to the rotation period rather than indefinitely.
2. **Defense against undetected breaches**: Even if a key compromise goes undetected, regular rotation ensures the compromised key eventually becomes invalid.

### Open Source and International Consideration
Given the open source nature of FormSG. Moving away from hardcoded keys to better key management significantly improves FormSG's ecosystem as an open source project.
1. **Separation of security concerns**: With JWKS, sensitive key material is no longer embedded in the open source codebase, allowing anyone to use, review, and contribute to the SDK without access to production keys.
2. **Environment flexibility**: Open source contributors can point the SDK to their own JWKS endpoints for development and testing, making contributions easier without depending on official FormSG infrastructure.

We already have fully working forks of FormSG, if interested parties want to further explore FormSG's capabilities, they will likely need this SDK down the line.

### Fetching keys from JWKS endpoint
Blabla
```json
{
  "keys": [
    {
      "kty": "OKP",
      "kid": "signing-webhook-key-staging-v1",
      "use": "sig",
      "alg": "EdDSA",
      "crv": "Ed25519",
      "x": "<public key in base64url>"
    },
    {
      "kty": "OKP",
      "kid": "signing-otp-key-staging-v1",
      "use": "verify",
      "alg": "EdDSA",
      "crv": "Ed25519",
      "x": "<public key in base64url>"
    }
  ]
}
```


#### Why JWKS?
JWKS (JSON Web Key Set) provides a standardized way to distribute cryptographic keys used for signature verification. It offers several advantages:

1. Keys can be rotated without requiring SDK updates
2. All public keys are hosted in one discoverable location
3. Follows well-established security standards (RFC 7517)
5. Allows multiple key versions to exist simultaneously during rotation periods

#### Why does the key  need to be in base64url format?
The key is encoded in base64url format as per the JWKS specification. This encoding ensures the key material can be safely transported in URLs and JSON documents without special character escaping issues. Base64url is a URL-safe variant of base64 that replaces '+' with '-', '/' with '_', and omits padding characters ('=').

So a base64 key such as
```
```

In base64url it would be
```
```

#### What happens during key rotation?
1. A new key pair is generated and the new public key is added to the JWKS endpoint with a new kid (key ID)
2. Both the old and new keys remain available in the JWKS for a transition period
3. The SDK fetches the latest keys from the JWKS endpoint automatically
4. When verifying signatures, SDK tries keys matching the kid in the signature header
5. This allows for a seamless transition as systems gradually start using the new key
6. After the transition period, the old key may be removed from the JWKS

#### How do I generate a new pair of keys?
The keys are ED25519 keys, which, in theory, can be generated in any way you want. Be it via a script using `openssl`, or any cryptographic library you're comfortable with.

For convenience, we have provided a `generateKey.ts` using `nacl.sign.keypair()` to generate the keys. You can just run it and just copy paste the public key in base64url format.

See examples/generate/README.md for more details.

#### Lightweight Caching
The JWKS response are cached in-memory, this is useful for long running applications.

When a key rotation happens, the cache will have old keys, since we're passing the `kid` in the signature header, SDK will try refetching JWKS to get the fresh keys, ensuring no failed signature verification due to stale cache.

### Using custom keys injected at SDK initialisation
If you don't have a JWKS endpoint set up, you can inject your custom keys when initialising the SDK instance.
```typescript
import { FormSgSdk } from '@opengovsg/formsg-sdk'

const formsg = new FormSgSdk({
  mode: 'production',
  ...
})
```

#### What happens during a key rotation?
When using custom keys, the SDK instance does not automatically update when keys are rotated. You'll need to manually re-initialise the SDK instance with the fresh set of keys. This requires code changes to update the keys and restart any services using the SDK to pick up the new keys.

### Hardcoded FormSG keys

### Key Fetching Fallback Order
Cache -> JWKS (if provided) -> Injected static custom keys (if provided) -> Hardcoded keys
The hardcoded keys will slowly be phased out in the future, since 1.0.0 is not in pilot yet.

## Method Changes
### Sync
table

### Async
table

## Example Migrations
some code
