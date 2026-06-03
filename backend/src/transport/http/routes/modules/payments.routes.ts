import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import {
  createRazorpayOrderHandler,
  markRazorpayFailureHandler,
  retryRazorpayOrderHandler,
  verifyRazorpayPaymentHandler,
} from "../../controllers/payment.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/razorpay/order", requireAuth, createRazorpayOrderHandler);
paymentsRouter.post("/razorpay/retry", requireAuth, retryRazorpayOrderHandler);
paymentsRouter.post("/razorpay/verify", requireAuth, verifyRazorpayPaymentHandler);
paymentsRouter.post("/razorpay/failure", requireAuth, markRazorpayFailureHandler);

