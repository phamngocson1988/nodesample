const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
import { success, failure } from "@/libs/response-lib";
import * as settingDB from "@/db/setting";

const main = async (event) => {
  try {
    const { channelId } = event.pathParameters;
    await settingDB.markDelete(channelId);
    return success({
      message: "Channel deleted",
    });
  } catch (error) {
    console.log(error);
    return failure({ message: error.message }, error.statusCode);
  }
};

const pathSchema = Joi.object().keys({
  channelId: Joi.string().required(),
});

export const handler = middy(main)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: { pathSchema } }))
  .use(httpErrorHandler());
