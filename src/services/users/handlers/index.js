import { undefinedMethod } from "@/libs/response-lib";
import signin from "./signin";
import signup from "./signup";
import profile from "./profile";
import logout from "./logout";

const collectionHandlers = {
    signup,
    signin,
    logout,
    profile
};

export const router = event => {
  const { method } = event['pathParameters'] ? event['pathParameters'] : {};
  return collectionHandlers[method] ? collectionHandlers[method](event) : undefinedMethod();
};
