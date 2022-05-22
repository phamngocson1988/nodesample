import AWSXRay from "aws-xray-sdk-core";
import http from "http";
import https from "https";
import axios from "axios";

if (!process.env.IS_LOCAL) {
  AWSXRay.captureHTTPsGlobal(http);
  AWSXRay.captureHTTPsGlobal(https);
}

export default axios;
