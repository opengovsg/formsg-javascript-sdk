class MissingSecretKeyError extends Error {
  constructor(
    message = 'Provide a secret key when when initializing the FormSG SDK to use this function.'
  ) {
    super(message)
    this.name = this.constructor.name

    // Set the prototype explicitly.
    // See https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, MissingSecretKeyError.prototype)
  }
}

class WebhookAuthenticateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    // Set the prototype explicitly.
    // See https://github.com/facebook/jest/issues/8279
    Object.setPrototypeOf(this, WebhookAuthenticateError.prototype)
  }
}

export { MissingSecretKeyError, WebhookAuthenticateError }
