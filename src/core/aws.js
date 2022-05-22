import AWSRaw from "aws-sdk";
import AWSXRay from "aws-xray-sdk-core";
const AWS = process.env.IS_LOCAL ? AWSRaw : AWSXRay.captureAWS(AWSRaw);

const config = {
  region: process.env.REGION,
  maxRetries: 6,
  httpOptions: {
    timeout: 5000, // 5s
    connectTimeout: 5000 //5s
  }
};
AWS.config.update(config);

export default AWS;
