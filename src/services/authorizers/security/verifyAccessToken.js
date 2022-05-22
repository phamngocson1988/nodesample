const createError = require("http-errors");

export const verifyAccessToken = async (event, accessToken) => {
  try {
    // TODO: need to be implemented
    const result = event || accessToken;
    if (!result) {
      throw createError(401, "Unauthorized");
    }
  } catch (error) {
    console.log(error);
    throw createError(401, "Unauthorized");
  }
};
