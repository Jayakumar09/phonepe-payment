import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prevent duplicate fetches
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchPaymentDetails = async () => {
      // Get all query parameters from PhonePe redirect
      const orderId = searchParams.get("orderId");
      const transactionId = searchParams.get("transactionId");
      const merchantOrderId = searchParams.get("merchantOrderId");
      const amount = searchParams.get("amount");
      const state = searchParams.get("state");
      const code = searchParams.get("code");
      const message = searchParams.get("message");
      const paymentMode = searchParams.get("paymentMode");
      const transactionStatus = searchParams.get("transactionStatus");

      // Collect all parameters for display
      const urlParams = {};
      searchParams.forEach((value, key) => {
        urlParams[key] = value;
      });

      console.log("URL Query Parameters:", urlParams);

      // Get stored order details
      const storedOrderDetails = sessionStorage.getItem("orderDetails");
      const orderData = storedOrderDetails ? JSON.parse(storedOrderDetails) : {};

      // If we have URL parameters from PhonePe, use them
      if (Object.keys(urlParams).length > 0 && orderId) {
        setPaymentDetails({
          orderId: orderId || merchantOrderId || orderData.orderId || "N/A",
          transactionId: transactionId || "N/A",
          amount: amount ? `₹ ${(amount / 100).toFixed(2)}` : (orderData.amount ? `₹ ${orderData.amount}` : "N/A"),
          planName: orderData.planName || "Subscription",
          paymentMode: orderData.paymentMode || paymentMode || "Online",
          state: state || "COMPLETED",
          code: code || "SUCCESS",
          message: message || "Payment successful",
          transactionStatus: transactionStatus || "SUCCESS",
          date: new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        setLoading(false);
        return;
      }

      // If we have orderId from sessionStorage, check status from backend
      if (orderData.orderId) {
        try {
          console.log("Fetching payment status for order:", orderData.orderId);
          
          const response = await axios.get(
            `http://localhost:5000/api/payment/status/${orderData.orderId}`
          );

          console.log("Payment Status Response:", response.data);

          const statusData = response.data;
          
          setPaymentDetails({
            orderId: statusData.orderId || orderData.orderId || "N/A",
            transactionId: statusData.transactionId || statusData.paymentDetails?.transactionId || "N/A",
            amount: statusData.amount ? `₹ ${(statusData.amount / 100).toFixed(2)}` : (orderData.amount ? `₹ ${orderData.amount}` : "N/A"),
            planName: orderData.planName || "Subscription",
            state: statusData.state || statusData.status || "COMPLETED",
            code: statusData.code || "SUCCESS",
            message: statusData.message || "Payment successful",
            paymentMode: statusData.paymentMode || statusData.paymentDetails?.paymentMode || "Online",
            transactionStatus: statusData.status || "SUCCESS",
            date: new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        } catch (err) {
          console.error("Failed to fetch payment status:", err);
          
          // Fallback to stored data
          setPaymentDetails({
            orderId: orderData.orderId || "N/A",
            transactionId: "Pending Confirmation",
            amount: orderData.amount ? `₹ ${orderData.amount}` : "N/A",
            planName: orderData.planName || "Subscription",
            state: "PROCESSING",
            code: "PENDING",
            message: "Payment is being verified. You will receive a confirmation shortly.",
            paymentMode: "Online",
            transactionStatus: "PENDING",
            date: new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
        setLoading(false);
        return;
      }

      // Default: Show a generic success with current date
      setPaymentDetails({
        orderId: "ORD_" + Date.now(),
        transactionId: "TXN_" + Date.now(),
        amount: "N/A",
        planName: "Subscription",
        state: "INITIATED",
        code: "PENDING",
        message: "Payment initiated. Awaiting confirmation.",
        paymentMode: "Online",
        transactionStatus: "PENDING",
        date: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setLoading(false);
    };

    fetchPaymentDetails();
  }, [searchParams]);

  const handleBackToPlans = () => {
    sessionStorage.removeItem("orderDetails");
    navigate("/");
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="success-container">
        <div className="success-card">
          <div className="loading-spinner"></div>
          <h2>Verifying Payment Details...</h2>
          <p style={{ color: "#718096" }}>Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  const isSuccess = paymentDetails?.state === "COMPLETED" || 
                    paymentDetails?.code === "SUCCESS" ||
                    paymentDetails?.transactionStatus === "SUCCESS";

  return (
    <div className="success-container">
      <div className="success-card">
        <div className={`success-icon ${isSuccess ? "success" : "pending"}`}>
          {isSuccess ? "✓" : "⏳"}
        </div>
        <h1>{isSuccess ? "Payment Successful!" : "Payment Status"}</h1>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {paymentDetails && (
          <div className="payment-details">
            <h3>Transaction Details</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <td className="label">Order ID</td>
                  <td className="value order-id">{paymentDetails.orderId}</td>
                </tr>
                <tr>
                  <td className="label">Transaction ID</td>
                  <td className="value">{paymentDetails.transactionId}</td>
                </tr>
                {paymentDetails.planName && (
                  <tr>
                    <td className="label">Plan</td>
                    <td className="value">{paymentDetails.planName}</td>
                  </tr>
                )}
                <tr>
                  <td className="label">Amount Paid</td>
                  <td className="value amount">{paymentDetails.amount}</td>
                </tr>
                <tr>
                  <td className="label">Payment Mode</td>
                  <td className="value">{paymentDetails.paymentMode}</td>
                </tr>
                <tr>
                  <td className="label">Status</td>
                  <td className="value">
                    <span className={`status-badge ${isSuccess ? "success" : "pending"}`}>
                      {paymentDetails.state || paymentDetails.transactionStatus}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="label">Date & Time</td>
                  <td className="value">{paymentDetails.date}</td>
                </tr>
                {paymentDetails.message && (
                  <tr>
                    <td className="label">Message</td>
                    <td className="value">{paymentDetails.message}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="info-section">
          <p>🎉 Thank you for your subscription!</p>
          <p>A confirmation email will be sent to your registered email address.</p>
        </div>

        <div className="button-group">
          <button className="back-button" onClick={handleBackToPlans}>
            ← Back to Plans
          </button>
          <button className="print-button" onClick={handlePrintReceipt}>
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
