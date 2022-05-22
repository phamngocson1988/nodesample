const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
import { success, failure } from "@/libs/response-lib";
import * as connectionDB from "@/db/connections/connection";
const createError = require("http-errors");

const main = async (event) => {
  try {
    const { connectionId } = event.requestContext;
    const connection = await connectionDB.getConnection(connectionId);
    console.log("disConnection connection", connection);
    if (!connection) {
      throw createError(404, `Connection ${connectionId} not found`);
    }
    const { pk } = connection;
    await connectionDB.removePK(pk, connectionId);
    return success({ message: "Connection deleted successfully" });
  } catch (error) {
    console.log("disConnection error", JSON.stringify(error));
    console.log("disConnection event", JSON.stringify(event));
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
