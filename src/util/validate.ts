function determineIsFormFields(tbd: any): tbd is FormField[] {
  if (!Array.isArray(tbd)) {
    return false
  }

  // If there exists even a single internal response that does not fit the
  // shape, the object is not created properly.
  const filter = tbd.filter(
    (internal) =>
      // Have either answer or answerArray or is isHeader
      // Since empty strings are allowed, check using typeof.
      (typeof internal.answer === 'string' ||
        Array.isArray(internal.answerArray) ||
        internal.isHeader) &&
      internal._id &&
      internal.fieldType &&
      internal.question
  )

  return filter.length === tbd.length
}

export { determineIsFormFields }
