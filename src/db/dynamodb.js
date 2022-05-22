import AWS from '@/core/aws';

export const keepAlive = () => {
  const https = require("https");

  const sslAgent = https.Agent({
    keepAlive: true,
    maxSockets: 50,
    rejectUnauthorized: true,
    timeout: 30
  });
  sslAgent.setMaxListeners(0);

  AWS.config.update({
    maxRetries: 3,
    httpOptions: {
      agent: sslAgent,
      timeout: 5000, // 5s
      connectTimeout: 5000 // 5s
    }
  });
};

export const call = (action, params) => {
  const DynamoDB = new AWS.DynamoDB({ apiVersion: '2012-08-10', maxRetries: 5 });
  const DDB = new AWS.DynamoDB.DocumentClient({
    service: DynamoDB,
    convertEmptyValues: true
  });
  return DDB[action](params).promise();
};
