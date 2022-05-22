import * as DDB from "@/db/dynamodb";

const CONNECTION_TABLE = process.env.ConnectionTable;

const getPK = (channelId, userId) => {
  return `${channelId}_${userId}`;
};

const getSK = (connectionId) => {
  return connectionId;
};

export const put = async (channelId, userId, connectionId, endpoint) => {
  const ttl = Math.floor(Date.now() / 1000) + 1 * 24 * 3600; // seconds
  const item = {
    pk: getPK(channelId, userId),
    sk: getSK(connectionId),
    connectionId,
    userId,
    channelId,
    endpoint,
    ttl,
  };
  await DDB.call("put", {
    TableName: CONNECTION_TABLE,
    Item: item,
  });
  return item;
};

export const remove = async (channelId, userId, connectionId) => {
  await DDB.call("delete", {
    TableName: CONNECTION_TABLE,
    Key: {
      pk: getPK(channelId, userId),
      sk: getSK(connectionId),
    },
  });
};

export const removePK = async (pk, connectionId) => {
  await DDB.call("delete", {
    TableName: CONNECTION_TABLE,
    Key: {
      pk,
      sk: getSK(connectionId),
    },
  });
};

export const getUserConnections = async (channelId, userId) => {
  const result = await DDB.call("query", {
    TableName: CONNECTION_TABLE,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": getPK(channelId, userId),
    },
  });
  return result.Items || [];
};

export const getConnection = async (connectionId) => {
  const params = {
    TableName: CONNECTION_TABLE,
    IndexName: "connectionId-index",
    KeyConditionExpression: "connectionId = :connectionId",
    ExpressionAttributeValues: {
      ":connectionId": connectionId,
    },
  };

  const result = await DDB.call("query", params);
  const { Items = [] } = result;
  return Items[0] || null;
};
