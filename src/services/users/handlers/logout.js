import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { success, failure } from "@/libs/response-lib";
import Logger from "@dazn/lambda-powertools-logger";

const main = async (event) => {
  try {
    return success({
      message: "Logout successfully",
    });
  } catch (error) {
    Logger.error("[Logout] error", { event }, error);
    return failure({ message: error.message }, error.statusCode);
  }
};

export default middy(main)
  .use(jsonBodyParser())
  .use(httpErrorHandler());
