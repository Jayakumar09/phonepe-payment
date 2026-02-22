import { createPhonePePayment, checkPaymentStatus } from "../services/phonepeService.js";

export const initiatePayment = async (req, res) => {
  try {
    const { plan, paymentMode } = req.body;

    console.log("Received plan:", plan);
    console.log("Received payment mode:", paymentMode);

    const plans = {
      BASIC: 199,
      PRO: 499,
      PREMIUM: 999,
    };

    if (!plan || !plans[plan]) {
      return res.status(400).json({ error: "Invalid Plan" });
    }

    const amount = plans[plan];
    const mode = paymentMode || "PAY_PAGE";

    const paymentResponse = await createPhonePePayment(plan, amount, mode);

    res.json(paymentResponse);

  } catch (error) {
    console.error("Payment Controller Error:", error.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const statusResponse = await checkPaymentStatus(orderId);

    res.json(statusResponse);

  } catch (error) {
    console.error("Status Check Error:", error.message);
    res.status(500).json({ error: "Failed to check payment status" });
  }
};

export const handleCallback = async (req, res) => {
  try {
    console.log("📱 PhonePe Callback Received:");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // PhonePe sends callback with encoded data
    // You can verify the callback using the X-VERIFY header
    // For now, we'll just log and acknowledge

    res.status(200).json({ status: "received" });
  } catch (error) {
    console.error("Callback Error:", error.message);
    res.status(500).json({ error: "Callback processing failed" });
  }
};