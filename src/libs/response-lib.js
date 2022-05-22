export const success = (body, statusCode = 200, headers) => {
  return buildResponse(statusCode, body, headers);
};

export const failure = (body, statusCode = 500, headers) => {
  return buildResponse(statusCode, body, headers);
};

export const buildResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "cache-control": "private, no-cache, no-store, must-revalidate",
      pragma: "no-cache",
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  };
};

export const undefinedMethod = () => {
  return failure({ message: "Action not found" }, 404);
};
