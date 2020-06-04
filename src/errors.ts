class MissingSecretKeyError extends Error {
  constructor() {
    super(
      'Provide a secret key when when initializing the FormSG SDK to use this function.'
    )
    this.name = 'MissingSecretKeyError'
  }
}

export { MissingSecretKeyError }
