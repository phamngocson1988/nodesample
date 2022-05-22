const createError = require("http-errors");

export const validator = ({ inputSchema }) => {
  const customMiddlewareBefore = async (request) => {
    if (inputSchema) {
      const { qsSchema, pathSchema, bodySchema } = inputSchema;
      const { event } = request;
      if (qsSchema) {
        const { error } = qsSchema.validate(event.queryStringParameters);
        if (error) {
          throw new createError(400, JSON.stringify(error.details));
        }
      }
      if (pathSchema) {
        const { error } = pathSchema.validate(event.pathParameters);
        if (error) {
          throw new createError(400, JSON.stringify(error.details));
        }
      }

      if (bodySchema) {
        const { error } = bodySchema.validate(event.body);
        if (error) {
          throw new createError(400, JSON.stringify(error.details));
        }
      }
    }
  };
  return {
    before: customMiddlewareBefore,
  };
};
