import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  createVNPayPaymentUrl,
  processVNPayReturn,
  processVNPayIPN,
  checkPaymentStatus,
} from "../controllers/Payment.controller";

const router = Router();

// VNPAY Payment Routes
router.post("/vnpay/create-payment-url", authMiddleware, createVNPayPaymentUrl);
router.post("/vnpay/payment-return", processVNPayReturn);
router.get("/vnpay/ipn", processVNPayIPN);
router.get("/check-status/:orderId", authMiddleware, checkPaymentStatus);

export default router;
