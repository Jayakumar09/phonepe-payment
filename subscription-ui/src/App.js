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

const paymentModes = [
  { 
    id: "PAY_PAGE", 
    name: "All Payment Methods", 
    icon: "💳", 
    description: "UPI, Cards, Wallets, Net Banking",
    recommended: true 
  },
  { 
    id: "UPI", 
    name: "UPI", 
    icon: "📱", 
    description: "Google Pay, PhonePe, Paytm, BHIM" 
  },
  { 
    id: "CARD", 
    name: "Card Payment", 
    icon: "💳", 
    description: "Credit & Debit Cards" 
  },
  { 
    id: "WALLET", 
    name: "Wallets", 
    icon: "👛", 
    description: "PhonePe, Paytm, AmazonPay" 
  },
  { 
    id: "NET_BANKING", 
    name: "Net Banking", 
    icon: "🏦", 
    description: "All major banks" 
  },
];

const PlansPage = () => {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("PAY_PAGE");

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handlePaymentModeSelect = (modeId) => {
    setSelectedPaymentMode(modeId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setErrorMsg("Please select a plan first.");
      return;
    }

    try {
      setErrorMsg("");
      setLoading(true);

      const selectedPlanData = plans.find(p => p.id === selectedPlan);

      const response = await axios.post(
        "http://localhost:5000/api/payment/initiate",
        { 
          plan: selectedPlan,
          paymentMode: selectedPaymentMode 
        }
      );

      console.log("FULL BACKEND RESPONSE:", response.data);

      // Store order details in sessionStorage for success page
      sessionStorage.setItem("orderDetails", JSON.stringify({
        orderId: response.data?.orderId || response.data?.merchantOrderId,
        amount: selectedPlanData?.price,
        planName: selectedPlanData?.name,
        paymentMode: selectedPaymentMode,
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

      {/* Plan Selection */}
      <div className="section">
        <h2>Select a Plan</h2>
        <div className="plans">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`card ${selectedPlan === plan.id ? "selected" : ""}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <h2>{plan.name}</h2>
              <p className="price">₹ {plan.price}</p>
              <div className="checkmark">
                {selectedPlan === plan.id ? "✓" : ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Mode Selection */}
      {selectedPlan && (
        <div className="section payment-mode-section">
          <h2>Select Payment Method</h2>
          <div className="payment-modes">
            {paymentModes.map((mode) => (
              <div 
                key={mode.id} 
                className={`payment-mode-card ${selectedPaymentMode === mode.id ? "selected" : ""}`}
                onClick={() => handlePaymentModeSelect(mode.id)}
              >
                {mode.recommended && <span className="recommended-badge">Recommended</span>}
                <span className="payment-icon">{mode.icon}</span>
                <h3>{mode.name}</h3>
                <p>{mode.description}</p>
                <div className="checkmark">
                  {selectedPaymentMode === mode.id ? "✓" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribe Button */}
      {selectedPlan && (
        <button
          className="subscribe-button"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? "Processing..." : `Pay ₹${plans.find(p => p.id === selectedPlan)?.price}`}
        </button>
      )}
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
