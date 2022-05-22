const createError = require("http-errors");

export const validate = async (event, { qsSchema, pathSchema, bodySchema }) => {
  if (qsSchema) {
    const { error } = qsSchema.validate(event.queryStringParameters);
    if (error) {
      throw createError(400, JSON.stringify(error.details));
    }
  }
  if (pathSchema) {
    const { error } = pathSchema.validate(event.pathParameters);
    if (error) {
      throw createError(400, JSON.stringify(error.details));
    }
  }

  if (bodySchema) {
    event.body = JSON.parse(event.body);
    const { error } = bodySchema.validate(event.body);
    if (error) {
      throw createError(400, JSON.stringify(error.details));
    }
  }
};
