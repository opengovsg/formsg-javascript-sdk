# FormSG Node.js SDK

The Node.js SDK provides convenient utilities for verifying FormSG webhooks for applications written in server-side JavaScript.

## Installation

Install the package with

```bash
npm install @opengovsg/formsg-sdk --save
```

## Usage

### Webhook authentication

Protect your webhook endpoint with the FormSG SDK.

```javascript
// This example uses Express to receive webhooks
const app = require('express')()

const formsg = require('@opengovsg/formsg')()

// This is where your domain is hosted, and should match
// the URI supplied in the FormSG form dashboard
const POST_URI = 'https://my-domain.com/submissions'

app.post('/submissions', function(req, res, next) {
  try {
    formsg.webhooks.authenticate(req.headers['X-FormSG-Signature'], POST_URI)
    // Continue processing the POST body
    return next()
  } catch (e) {
    console.error(e)
    return res.status(401).send({ message: 'Unauthorized' })
  }
})

app.listen(8080, () => console.log('Running on port 8080')
```

## Configuration

```javascript
const formsg = require('@opengovsg/formsg')({
  mode: 'staging',
})
```

| Option | Default      | Description                                                     |
|--------|--------------|-----------------------------------------------------------------|
| mode   | 'production' | Set to 'staging' if integrating against FormSG staging servers. |

## Verifying signatures manually

You can use the following information to create a custom solution, although we recommend using this SDK.

The `X-FormSG-Signature` header contains the following information:

- Epoch timestamp prefixed by `t=`
- The FormSG submission ID prefixed by `s=`
- The FormSG form ID, prefixed by `f=`
- The signature scheme, prefixed by `v1=`. Currently this is the only signature scheme.

```text
X-FormSG-Signature: t=1582558358788,
  s=5e53ec96b10ee1010e00380b,
  f=5e4b8e3d1f61f00036c9937d,
  v1=rUAgQ9krNZspCrQtfSvRfjME6Nq4+I80apGXnCsNrwPbcq44SBNglWtA1MkpC/VhWtDeJfuV89uV2Aqi42UQBA==
```

Note that newlines have been added for clarity, but a real signature will be all in one line.

### Steps

#### Step 1 - Extract the key-value pairs from the header

Extract the the timestamp, signature, submission ID and form ID from the header, by using the `,` character as
a separator to get a list of elements, before splitting each element to get a key-value pair.

#### Step 2 - Prepare the basestring

This is achieved by concatenating the following strings with the `.` fullstop as the delimiter.

- The [href](https://nodejs.org/api/url.html#url_url_href) of the URI
- The submission ID
- The form ID
- The epoch timestamp

```text
https://my-domain.com/submissions.5e53ec96b10ee1010e00380b.5e4b8e3d1f61f00036c9937d.1582558358788
```

#### Step 3 - Verify the signature

The signature is signed with [ed25519](http://ed25519.cr.yp.to/).

Verify that the `v1` signature is valid using a library of your choice (we use [tweetnacl-js](https://github.com/dchest/tweetnacl-js)).

| FormSG environment | Public Key in base64                           |
|--------------------|------------------------------------------------|
| production         | '3Tt8VduXsjjd4IrpdCd7BAkdZl/vUCstu9UvTX84FWw=' |
| staging            | 'rjv41kYqZwcbe3r6ymMEEKQ+Vd+DPuogN+Gzq3lP2Og=' |

#### Step 4 - Protect against replay attacks

If the signature is valid, compute the difference between the current timestamp and the received epoch,
and decide if the difference is within your tolerance. We use a tolerance of 5 minutes.

#### Additional checks that you may undertake

- Check that request is for an expected form by verifying the form ID
- Check that the submission ID is new, and that your system has not received it before
