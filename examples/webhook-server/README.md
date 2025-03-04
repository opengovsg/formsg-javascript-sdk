# FormSG Webhook Demo Server

A simple Express server that demonstrates how to use the FormSG JavaScript SDK to receive and process form submissions via webhooks.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your FormSG form secret key

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npx nodemon webhook-server.ts
   ```

   Or use the npm script:
   ```bash
   npm start
   ```

## Exposing to the internet with ngrok

To receive webhooks from FormSG, your server needs to be accessible from the internet. You can use ngrok for this:

1. Install ngrok if you haven't already. You can do so via brew/any other means, here's how to using npm
   ```bash
   npm install -g ngrok
   ```

2. Start ngrok in a new terminal:
   ```bash
   ngrok http 3000
   ```

   Or use the npm script:
   ```bash
   npm run start:ngrok
   ```

3. Copy the HTTPS URL provided by ngrok (example: `https://a1b2c3d4.ngrok.io`)

4. Configure your FormSG form's webhook to point to this URL + `/submissions` (e.g., `https://a1b2c3d4.ngrok.io/submissions`)

## How it works

This example server:

1. Authenticates incoming webhook requests using the FormSG signature
2. Decrypts the form submission using your form secret key
3. Handles form submissions with or without file attachments
4. Logs the decrypted submission data

## Environment Variables

- `FORM_SECRET_KEY`: Your form's secret key from FormSG (required)
- `HAS_ATTACHMENTS`: Set to 'true' if your form contains file upload fields
- `FORMSG_ENV`: 'production' or 'staging' depending on which FormSG environment you're using
- `PORT`: The port to run the server on (default: 3000)
