const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
import { success, failure } from "@/libs/response-lib";
import { s3, options } from "./s3";

const main = async (event) => {
  try {
    const { projectId, channelId, userId, url } = event.body;
    // const requireKeyPrefix = `${projectId}/${channelId}/${userId}/`;
    // console.log(key, requireKeyPrefix)
    // if (!key.includes(requireKeyPrefix)) {
    //   throw new createError("url is invalid", 400);
    // }

    await deleteUrl(url);
    return success({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    return failure({ message: error.message }, error.statusCode);
  }
};

export const deleteUrl = async (url) => {
  try {
    const { pathname: key } = new URL(url);
    return s3
      .deleteObject({
        Bucket: options.bucket,
        Key: key,
      })
      .promise();
  } catch (error) {
    console.log("deleteUrl error", url, JSON.stringify(error));
    throw error;
  }
};

const bodySchema = Joi.object().keys({
  projectId: Joi.string().required(),
  channelId: Joi.string().required(),
  userId: Joi.string().required(),
  url: Joi.string().required(),
});

export const handler = middy(main)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: { bodySchema } }))
  .use(httpErrorHandler());
