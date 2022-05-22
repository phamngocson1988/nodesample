import middy from "@middy/core";
import { success, failure } from "@/libs/response-lib";
const main = async (event) => {
  try {
    return success({
      message: "success",
    });
  } catch (error) {
    console.log(error);
    return failure({ message: error.message }, error.statusCode);
  }
};

export const handler = middy(main);