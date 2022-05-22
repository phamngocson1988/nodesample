const createError = require("http-errors");

export const wsJsonBodyParser = (opts) => {
  const customMiddlewareBefore = async (request) => {
    opts = opts || {};
    try {
      request.event.body = JSON.parse(request.event.body, opts.reviver);
    } catch (err) {
      console.log("customMiddlewareBefore request", JSON.stringify(request));
      throw new createError.UnprocessableEntity("Content type defined as JSON but an invalid JSON was provided");
    }
  };
  return {
    before: customMiddlewareBefore,
  };
};
