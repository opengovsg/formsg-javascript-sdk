function determineIsFormFields(tbd: any): tbd is FormField[] {
  // Not array, early return.
  if (!Array.isArray(tbd)) {
    return false;
  }

  // If there exists even a single internal response that does not fit the
  // shape, the object is not created properly.
  const filter = tbd.filter(
    (internal) =>
      (internal.answer ||
        (Array.isArray(internal.answerArray) &&
          internal.answerArray.length > 0) ||
        internal.isHeader) &&
      internal.fieldType &&
      internal.question
  );

  return filter.length === tbd.length;
}

export { determineIsFormFields };
