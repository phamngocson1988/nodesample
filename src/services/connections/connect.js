const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
import { success, failure } from "@/libs/response-lib";
import * as connectionDB from "@/db/connections/connection";
import { verifyAccessToken } from "@/services/authorizers/security/verifyAccessToken";

const main = async (event) => {
  try {
    const { channelId, userId, accessToken } = event.queryStringParameters;
    await verifyAccessToken(event, accessToken);

    const { connectionId, domainName, stage } = event.requestContext;
    const endpoint = `${domainName}/${stage}`;
    const item = await connectionDB.put(channelId, userId, connectionId, endpoint);
    return success(item);
  } catch (error) {
    console.log(error, event);
    return failure({ message: error.message }, error.statusCode);
  }
};

const qsSchema = Joi.object().keys({
  channelId: Joi.string().required(),
  userId: Joi.string().required(),
  accessToken: Joi.string().required(),
});

export const handler = middy(main)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: { qsSchema } }))
  .use(httpErrorHandler());
