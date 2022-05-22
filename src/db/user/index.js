const createError = require("http-errors");
import * as DDB from "@/db/dynamodb";

const USER_TABLE = process.env.UserTable;

export const findByEmail = async (email) => {
  const result = await DDB.call("get", {
    TableName: USER_TABLE,
    Key: { email }
  });
  if (!result.Item) {
    throw createError(404, "Item not found.");
  }
  return result.Item;
};

export const update = async (channelId, userId, props) => {
  const items = { ...props, updatedAt: new Date().toISOString() };
  const updateExpression = Object.keys(items)
    .map(key => `${key} = :${key}`)
    .join(", ");

  const expressionAttributeValues = {};
  Object.keys(items).forEach(key => (expressionAttributeValues[`:${key}`] = items[key]));

  await DDB.call("update", {
    TableName: USER_TABLE,
    Key: {
      pk: channelId,
      sk: userId
    },
    UpdateExpression: `SET ${updateExpression}`,
    ExpressionAttributeValues: expressionAttributeValues
  });
};

export const create = async ({ id, email, hash }) => {
  const now = new Date().toISOString();
  const params = {
    TableName: USER_TABLE,
    Item: { id, email, hash, createdAt: now, updatedAt: now }
  };
  await DDB.call("put", params);
  return params.Item;
};

export const protectUser = user => {
  delete user['hash'];
  return user;
}
