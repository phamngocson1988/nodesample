export const encode = payload => {
  if (!payload) return "";

  const str = JSON.stringify(payload);
  return Buffer.from(str).toString("base64");
};

export const decode = nextPageToken => {
  if (!nextPageToken) return undefined;

  const str = Buffer.from(nextPageToken, "base64").toString("utf8");
  return JSON.parse(str);
};
