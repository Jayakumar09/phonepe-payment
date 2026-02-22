import express from "express";
import { initiatePayment, getPaymentStatus, handleCallback } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/initiate", initiatePayment);
router.get("/status/:orderId", getPaymentStatus);
router.post("/callback", handleCallback);

export default router;