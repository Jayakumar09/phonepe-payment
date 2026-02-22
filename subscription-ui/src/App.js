import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import SuccessPage from "./components/SuccessPage";
import "./App.css";

const plans = [
  { id: "BASIC", name: "Basic Plan", price: 199 },
  { id: "PRO", name: "Pro Plan", price: 499 },
  { id: "PREMIUM", name: "Premium Plan", price: 999 },
];

const PlansPage = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId) => {
    try {
      setErrorMsg("");
      setLoading(true);

      const selectedPlan = plans.find(p => p.id === planId);

      const response = await axios.post(
        "http://localhost:5000/api/payment/initiate",
        { plan: planId }
      );

      console.log("FULL BACKEND RESPONSE:", response.data);

      // Store order details in sessionStorage for success page
      sessionStorage.setItem("orderDetails", JSON.stringify({
        orderId: response.data?.orderId || response.data?.merchantOrderId,
        amount: selectedPlan?.price,
        planName: selectedPlan?.name,
        date: new Date().toISOString(),
      }));

      // Use checkoutUrl for PhonePe payment page
      const checkoutUrl = response.data?.checkoutUrl;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setErrorMsg("Payment URL not received from server.");
      }

    } catch (error) {
      console.error("Payment Error:", error.response?.data || error.message);

      setErrorMsg(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Choose Your Plan</h1>

      {errorMsg && (
        <p style={{ color: "red", marginBottom: "20px" }}>
          {errorMsg}
        </p>
      )}

      <div className="plans">
        {plans.map((plan) => (
          <div key={plan.id} className="card">
            <h2>{plan.name}</h2>
            <p className="price">&#8377; {plan.price}</p>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
            >
              {loading ? "Processing..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlansPage />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </Router>
  );
}

export default App;