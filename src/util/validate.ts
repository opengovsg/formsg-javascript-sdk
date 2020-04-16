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
        isHeader: Joi.boolean(),
        signature: Joi.string().allow(''),
      })
      // only answer or answerArray can be present at once
      .xor('answer', 'answerArray')
  )
  .required()

function determineIsFormFields(tbd: any): tbd is FormField[] {
  return FORM_FIELDS_SCHEMA.validate(tbd).error === undefined
}

export { determineIsFormFields }
