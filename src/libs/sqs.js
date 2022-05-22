import { SQS } from "aws-sdk";
const sqs = new SQS({ apiVersion: "2012-11-05" });

export const pushToSqs = async (data, group, url) => {
  console.log("TCL: pushToSqs -> url", url);
  console.log("TCL: pushToSqs -> url", JSON.stringify(data));

  const params = {
    MessageBody: JSON.stringify(data),
    QueueUrl: url,
    MessageGroupId: group,
  };
  return sqs
    .sendMessage(params)
    .promise()
    .then((sentResult) => {
      console.log(`[sqs.push] >> sent ${group}`, JSON.stringify(sentResult));
    })
    .catch((error) => {
      console.log(`[sqs.push] >> error ${group}`, JSON.stringify(error));
      throw error;
    });
};
