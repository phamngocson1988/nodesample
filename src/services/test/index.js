import middy from "@middy/core";
import { success, failure } from "@/libs/response-lib";

const test = async (event) => {
  try {
    return success({
      message: "success",
    });
  } catch (error) {
    console.log(error);
    return failure({ message: error.message }, error.statusCode);
  }
};

const collectionHandlers = {
  test,
};
const undefinedMethod = () => {
  return failure({ message: "Action not found" }, 404);
};

export const router = event => {
  const { method } = event['pathParameters'] ? event['pathParameters'] : {};
  return collectionHandlers[method] ? collectionHandlers[method](event) : undefinedMethod();
};
