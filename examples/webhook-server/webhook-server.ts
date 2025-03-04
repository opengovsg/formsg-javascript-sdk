import express from 'express'
import * as dotenv from 'dotenv'
import formSgSDK from '../../src'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Get the form secret key from environment variables
const formSecretKey = process.env.FORM_SECRET_KEY!
if (!formSecretKey) {
  console.error('FORM_SECRET_KEY environment variable is required')
  process.exit(1)
}

const HAS_ATTACHMENTS = process.env.HAS_ATTACHMENTS === 'true'

async function initializeFormSg() {
  const formsg = await formSgSDK({
    mode: (process.env.FORMSG_ENV as 'staging' | 'production') || 'production',
    ...(process.env.JWKS_URL && {
      jwks: {
        url: process.env.JWKS_URL,
        cacheDurationMs: 60_000, // 1 minute
        requestConfig: {
          timeoutMs: 5_000,
          retry: {
            maxRetries: 3,
            initialBackoffMs: 1_000,
          },
        },
      },
    }),
  })

  // This should match the webhook URI you configure in FormSG
  const WEBHOOK_PATH = '/submissions'
  const webhookUrl = `https://256d-103-6-151-166.ngrok-free.app${WEBHOOK_PATH}`

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    console.log('Headers:', JSON.stringify(req.headers, null, 2))
    next()
  })

  app.post(
    WEBHOOK_PATH,
    // Authenticate the webhook signature
    (req, res, next) => {
      try {
        const signature = req.get('X-FormSG-Signature')
        if (!signature) {
          console.error('No signature found in headers')
          return res.status(401).send({ message: 'Signature missing' })
        }

        formsg.webhooks.authenticate(signature, webhookUrl)
        console.log('Webhook authenticated successfully')
        return next()
      } catch (e) {
        console.error('Authentication failed:', e)
        return res.status(401).send({ message: 'Unauthorized' })
      }
    },
    // Parse JSON from raw body
    express.json(),
    // Decrypt the submission
    async (req, res) => {
      try {
        console.log('Processing submission...')

        if (!req.body.data) {
          return res.status(400).send({ message: 'No data provided' })
        }

        const submission = HAS_ATTACHMENTS
          ? await formsg.crypto.decryptWithAttachments(
              formSecretKey,
              req.body.data
            )
          : formsg.crypto.decrypt(formSecretKey, req.body.data)

        if (submission) {
          console.log('Submission decrypted successfully')

          // Print submission details (redacted for privacy)
          if (HAS_ATTACHMENTS && 'attachments' in submission) {
            console.log(
              'Contains attachments with field IDs:',
              Object.keys(submission.attachments)
            )

            // Just log attachment names, not the content
            Object.entries(submission.attachments).forEach(
              ([fieldId, file]) => {
                console.log(
                  `Field ${fieldId}: ${file.filename} (${file.content.byteLength} bytes)`
                )
              }
            )

            console.log(
              'Form responses:',
              submission.content.responses.map((field) => ({
                id: field._id,
                question: field.question,
              }))
            )
          }

          return res
            .status(200)
            .send({ message: 'Submission processed successfully' })
        } else {
          console.error('Could not decrypt submission')
          return res.status(400).send({ message: 'Decryption failed' })
        }
      } catch (e) {
        console.error('Error processing submission:', e)
        return res.status(500).send({ message: 'Internal server error' })
      }
    }
  )

  app.listen(PORT, () => {
    console.log(`
      FormSG Webhook Demo Server

      Server running at http://localhost:${PORT}
      Webhook endpoint: ${webhookUrl}

      To expose your local server to the internet:
      Run 'npm run start:ngrok' in another terminal
    `)
  })
}

initializeFormSg().catch((error) => {
  console.error('Failed to initialize FormSG SDK:', error)
  process.exit(1)
})
