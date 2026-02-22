import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.PHONEPE_BASE_URL;

// ===============================
// GET ACCESS TOKEN
// ===============================
const getAccessToken = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/v1/oauth/token`,
      new URLSearchParams({
        client_id: process.env.PHONEPE_CLIENT_ID,
        client_secret: process.env.PHONEPE_CLIENT_SECRET,
        client_version: process.env.PHONEPE_CLIENT_VERSION,
        grant_type: "client_credentials",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("✅ Access Token Received");
    return response.data.access_token;
  } catch (error) {
    console.log("🔥 TOKEN ERROR:");
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Message:", error.message);
    throw new Error("Failed to get access token");
  }
};

// ===============================
// CREATE PAYMENT
// ===============================
export const createPhonePePayment = async (plan, amount, paymentMode = "PAY_PAGE") => {
  try {
    if (!amount || isNaN(amount)) {
      throw new Error("Invalid amount passed to PhonePe");
    }

    const accessToken = await getAccessToken();

    // Build payment instrument based on selected mode
    let paymentInstrument;
    
    switch (paymentMode) {
      case "UPI":
        paymentInstrument = {
          type: "PAY_PAGE",
        };
        break;
      case "CARD":
        paymentInstrument = {
          type: "PAY_PAGE",
        };
        break;
      case "WALLET":
        paymentInstrument = {
          type: "PAY_PAGE",
        };
        break;
      case "NET_BANKING":
        paymentInstrument = {
          type: "PAY_PAGE",
        };
        break;
      case "UPI_INTENT":
        paymentInstrument = {
          type: "UPI_INTENT",
        };
        break;
      case "PAY_PAGE":
      default:
        paymentInstrument = {
          type: "PAY_PAGE",
        };
        break;
    }

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantOrderId: "ORD_" + Date.now(), // ✅ REQUIRED
      merchantUserId: "USER_" + Date.now(),
      amount: Number(amount) * 100,
      redirectUrl: `${process.env.FRONTEND_URL}/success`,
      redirectMode: "GET",
      callbackUrl: `${process.env.BACKEND_URL}/api/payment/callback`,
      mobileNumber: "9999999999",
      paymentInstrument: paymentInstrument,
    };

    console.log("🔥 PAYMENT PAYLOAD:", payload);
    console.log("💳 Payment Mode:", paymentMode);

    const response = await axios.post(
      `${BASE_URL}/checkout/v2/pay`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );

    console.log("✅ Payment Created Successfully");
    console.log("📱 FULL PHONEPE RESPONSE:", JSON.stringify(response.data, null, 2));
    
    // PhonePe Checkout v2 response structure:
    // The response contains orderId which we use to construct the checkout URL
    // IMPORTANT: The checkout page is on a different domain than the API
    // API domain: api-preprod.phonepe.com/apis/pg-sandbox
    // Checkout domain: checkout-preprod.phonepe.com (sandbox) or checkout.phonepe.com (prod)
    
    const orderId = response.data.orderId;
    const redirectUrl = response.data.redirectUrl;
    
    // Log all available fields for debugging
    console.log("🔗 Available response fields:", Object.keys(response.data));
    console.log("🔗 Order ID:", orderId);
    console.log("🔗 Redirect URL from PhonePe:", redirectUrl);
    
    // Construct the correct checkout URL
    // For sandbox/preprod: https://checkout-preprod.phonepe.com/v2/pay?orderId={orderId}
    // For production: https://checkout.phonepe.com/v2/pay?orderId={orderId}
    let checkoutUrl;
    
    if (redirectUrl && !redirectUrl.includes('/apis/pg-sandbox')) {
      // Use PhonePe's redirectUrl if it's not pointing to the API endpoint
      checkoutUrl = redirectUrl;
    } else {
      // Construct the checkout URL manually
      // Determine if we're in sandbox or production based on BASE_URL
      const isSandbox = BASE_URL.includes('preprod') || BASE_URL.includes('sandbox');
      const checkoutDomain = isSandbox ? 'checkout-preprod.phonepe.com' : 'checkout.phonepe.com';
      checkoutUrl = `https://${checkoutDomain}/v2/pay?orderId=${orderId}`;
    }
    
    console.log("🔗 Final Checkout URL:", checkoutUrl);
    
    if (!orderId) {
      console.error("⚠️ No orderId in PhonePe response!");
      throw new Error("PhonePe did not return an order ID");
    }
    
    return {
      ...response.data,
      checkoutUrl: checkoutUrl,
      orderId: orderId
    };

  } catch (error) {
    console.log("🔥 PHONEPE FULL ERROR:");
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Message:", error.message);

    throw new Error("Payment initiation failed");
  }
};

// ===============================
// CHECK PAYMENT STATUS
// ===============================
export const checkPaymentStatus = async (orderId) => {
  try {
    const accessToken = await getAccessToken();

    console.log("🔍 Checking payment status for order:", orderId);

    const response = await axios.get(
      `${BASE_URL}/checkout/v2/order/${orderId}/status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `O-Bearer ${accessToken}`,
        },
      }
    );

    console.log("✅ Payment Status Response:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log("🔥 STATUS CHECK ERROR:");
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Message:", error.message);

    throw new Error("Failed to check payment status");
  }
};