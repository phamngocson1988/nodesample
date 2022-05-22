import * as DDB from "./dynamodb";
import { CURRENT_SETTING_VERSION, SETTING_STATUS_DELETED, ALL_SETTINGS_VERSIONS } from "@/constants";
const createError = require("http-errors");
import latestDefaultSettings from "@/constants/settings/settings-v1.json";

const SETTING_TABLE = process.env.SettingTable;

export const getCurrent = async channelId => {
  const result = await DDB.call("get", {
    TableName: SETTING_TABLE,
    Key: { pk: channelId, sk: CURRENT_SETTING_VERSION }
  });
  if (!result.Item || result.Item.status === SETTING_STATUS_DELETED) {
    throw createError(404, "Settings not found");
  }
  if (!result.Item.settings) {
    throw createError(404, "Settings is undefined");
  }
  return result.Item;
};

export const get = async (channelId, version) => {
  const result = await DDB.call("get", {
    TableName: SETTING_TABLE,
    Key: { pk: channelId, sk: version }
  });
  if (!result.Item || result.Item.status === SETTING_STATUS_DELETED) {
    throw createError(404, "Settings not found");
  }
  if (!result.Item.settings) {
    throw createError(404, "Settings is undefined");
  }
  return result.Item;
};

export const put = async ({ version, settings }) => {
  const now = new Date().toISOString();
  const params = {
    TableName: SETTING_TABLE,
    Item: {
      version,
      settings: JSON.stringify(settings),
      createdAt: now,
      updatedAt: now
    }
  };
  await DDB.call("put", params);
  return params.Item;
};

export const getDefaultProfilesVersions = async () => {
  return ALL_SETTINGS_VERSIONS;
};

export const getLatestDefaultProfile = async () => {
  return latestDefaultSettings;
};

export const batchPut = async items => {
  await DDB.call("batchWrite", {
    RequestItems: {
      [SETTING_TABLE]: items.map(item => {
        return {
          PutRequest: {
            Item: item
          }
        };
      })
    }
  });
};

export const getChannelProfileProperties = async (channelId, version, fields) => {
  version = version || CURRENT_SETTING_VERSION;

  const result = await DDB.call("get", {
    TableName: SETTING_TABLE,
    Key: { pk: channelId, sk: CURRENT_SETTING_VERSION },
    ProjectionExpression: fields ? fields.join(", ") : undefined
  });
  return result.Item;
};

export const updateChannelProfileProperties = async (channelId, version, fields) => {
  if (!version) {
    const profile = await getChannelProfileProperties(channelId, undefined, ["version"]);
    version = profile.version;
  }

  const updateItems = Object.keys(fields).map(key => `${key} = :${key}`);
  const values = Object.keys(fields).reduce((obj, key) => {
    obj[`:${key}`] = fields[key];
    return obj;
  }, {});

  const params = {
    TableName: SETTING_TABLE,
    Key: {
      pk: channelId,
      sk: version
    },
    UpdateExpression: `SET ${updateItems.join(", ")}`,
    ExpressionAttributeValues: values
  };

  await DDB.call("update", params);
};

export const deleteChannelProfileProperties = async (channelId, version, fields) => {
  if (!version) {
    const profile = await getChannelProfileProperties(channelId, undefined, ["version"]);
    version = profile.version;
  }

  const params = {
    TableName: SETTING_TABLE,
    Key: {
      pk: channelId,
      sk: version
    },
    UpdateExpression: `REMOVE ${fields.join(", ")}`
  };

  await DDB.call("update", params);
};

export const remove = async channelId => {
  const result = await DDB.call("query", {
    TableName: SETTING_TABLE,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": channelId
    },
    ProjectionExpression: "pk, sk"
  });

  if (result.Items.length === 0) {
    // throw Error("Channel not found");
    return;
  }

  const arr = result.Items.map(item => {
    const { pk, sk } = item;
    return {
      DeleteRequest: {
        Key: {
          pk,
          sk
        }
      }
    };
  });

  await DDB.call("batchWrite", {
    RequestItems: {
      [SETTING_TABLE]: arr
    }
  });
};

export const markDelete = async channelId => {
  const result = await DDB.call("query", {
    TableName: SETTING_TABLE,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": channelId
    }
  });

  if (result.Items.length === 0) {
    // throw createError(404, "Settings not found");
    return;
  }

  // 5 days time to live
  // const ttl = Math.floor(Date.now() / 1000) + 5 * 24 * 3600; // seconds

  const arr = result.Items.map(item => {
    return {
      PutRequest: {
        Item: {
          ...item,
          status: SETTING_STATUS_DELETED
        }
      }
    };
  });

  await DDB.call("batchWrite", {
    RequestItems: {
      [SETTING_TABLE]: arr
    }
  });
};
