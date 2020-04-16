import Joi from '@hapi/joi'

const FORM_FIELDS_SCHEMA = Joi.array()
  .items(
    Joi.object()
      .keys({
        _id: Joi.string().required(),
        question: Joi.string().required(),
        fieldType: Joi.string().required(),
        answer: Joi.string().allow(''),
        answerArray: Joi.array(),
        filename: Joi.string(),
        content: Joi.binary(),
        isHeader: Joi.boolean(),
        myInfo: Joi.object(),
        signature: Joi.string().allow(''),
      })
      .xor('answer', 'answerArray') // only answer or answerArray can be present at once
      .with('filename', 'content') // if filename is present, content must be present
  )
  .required()

function determineIsFormFields(tbd: any): tbd is FormField[] {
  return !FORM_FIELDS_SCHEMA.validate(tbd).error
}

export { determineIsFormFields }
