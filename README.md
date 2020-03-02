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
  } catch {
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
