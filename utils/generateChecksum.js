import crypto from "crypto";
import phonepeConfig from "../config/phonepeConfig.js";

const generateChecksum = (payload, path) => {
  const string = payload + path + phonepeConfig.saltKey;

  const sha256 = crypto
    .createHash("sha256")
    .update(string)
    .digest("hex");

  return `${sha256}###${phonepeConfig.saltIndex}`;
};

export default generateChecksum;