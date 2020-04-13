function determineIsDecryptedResponses(tbd: any): tbd is DecryptedResponse[] {
  // Not array, early return.
  if (!Array.isArray(tbd)) {
    return false;
  }

  // If there exists even a single internal response that does not fit the
  // shape, the object is not created properly.
  return (
    tbd.filter(
      (internal) => internal.answer && internal.fieldType && internal.question
    ).length === tbd.length
  );
}
