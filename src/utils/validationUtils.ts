import Joi from 'joi';

/* Extracts a property from a schema and validate the value using the extracted property */
export const validateFromSchema = (
  schema: Joi.ObjectSchema,
  schemaProperty: string,
  value: any
): string | boolean => {
  const { error } = schema.extract(schemaProperty).validate(value);
  if (error) {
    return error.message;
  }

  return true;
};
