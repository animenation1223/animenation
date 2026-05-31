import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import {
  createRazorpayOrderHandler,
  markRazorpayFailureHandler,
  retryRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
} from "../../controllers/payment.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/payments/razorpay/order", requireAuth, createRazorpayOrderHandler);
paymentsRouter.post("/payments/razorpay/retry", requireAuth, retryRazorpayOrderHandler);
paymentsRouter.post("/payments/razorpay/verify", requireAuth, verifyRazorpayPaymentHandler);
paymentsRouter.post("/payments/razorpay/failure", requireAuth, markRazorpayFailureHandler);

