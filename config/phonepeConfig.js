import dotenv from "dotenv";

// Load env here directly
dotenv.config({ path: "./.env" });

const phonepeConfig = {
  clientId: process.env.PHONEPE_CLIENT_ID,
  clientSecret: process.env.PHONEPE_CLIENT_SECRET,
  clientVersion: process.env.PHONEPE_CLIENT_VERSION,
  merchantId: process.env.PHONEPE_MERCHANT_ID,  // ✅ add this
  baseUrl: process.env.PHONEPE_BASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
};

// Debug check
console.log("CONFIG BASE URL:", phonepeConfig.baseUrl);

export default phonepeConfig;