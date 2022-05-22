const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
const createError = require("http-errors");
import { success, failure } from "@/libs/response-lib";
import { s3, options } from "./s3";

const main = async (event) => {
  try {
    const { projectId, channelId, userId, name, size, type, tagging } = event.queryStringParameters;
    const key = `uploads/${projectId}/${channelId}/${userId}/${new Date().toISOString()}/${name}`;
    const params = {
      Bucket: options.bucket,
      Key: key,
      Expires: 300,
      ContentType: type,
      Tagging: tagging,
    };

    const signedUrl = s3.getSignedUrl("putObject", params);
    if (!signedUrl) {
      throw createError(500, "Cannot create S3 signed URL");
    }

    // you may also simply return the signed url, i.e. `return { signedUrl }`
    return success({
      signedUrl,
      name,
      size,
      type,
      filePath: key,
      publicUrl: `${process.env.WEBCHAT_CDN_URL}${new URL(signedUrl.split("?").shift()).pathname}`,
      // publicUrl: signedUrl.split("?").shift()
    });
  } catch (error) {
    console.log(error);
    return failure({ message: error.message }, error.statusCode);
  }
};

const qsSchema = Joi.object().keys({
  projectId: Joi.string().required(),
  channelId: Joi.string().required(),
  userId: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string().allow(""), // Some files don't have type info => type = ""
  size: Joi.string(),
  tagging: Joi.string(),
});

export const handler = middy(main)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: { qsSchema } }))
  .use(httpErrorHandler());
