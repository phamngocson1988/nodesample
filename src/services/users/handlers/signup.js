const Joi = require("joi");
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpErrorHandler from "@middy/http-error-handler";
import { validator } from "@/middlewares/validator";
import { success, failure } from "@/libs/response-lib";
import Logger from "@dazn/lambda-powertools-logger";
import { SignupService } from "@/services/users/signup";

const main = async (event) => {
  try {
    const { email, password } = event.body;
    const service = new SignupService({ email, password });
    const user = await service.process();
    if (!user) {
      const errors = service.getErrors();
      Logger.info("[Signup] fail", { errors });
      return failure({ message: 'Error' }, 400);
    }
    return success( user );
  } catch (error) {
    Logger.error("[Signup] error", { event }, error);
    return failure({ message: error.message }, error.statusCode);
  }
};

const bodySchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

export default middy(main)
  .use(jsonBodyParser())
  .use(validator({ inputSchema: { bodySchema } }))
  .use(httpErrorHandler());
