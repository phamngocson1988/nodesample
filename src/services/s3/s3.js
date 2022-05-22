import AWS from "@/core/aws";

export const options = {
  bucket: process.env.WEBCHAT_UPLOAD_BUCKET,
  region: process.env.WEBCHAT_UPLOAD_BUCKET_REGION,
  signatureVersion: "v4"
};

export const s3 = new AWS.S3(options);
