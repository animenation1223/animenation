import type { RequestHandler } from "express";
import { z } from "zod";
import { HttpError } from "../middleware/errorHandler";
import {
  createRazorpayOrder,
  handleRazorpayWebhook,
  recordPaymentFailure,
  verifyRazorpayPaymentAndCreateOrder,
} from "../../../services/payment/payment.service";

const checkoutSchema = z.object({
  payment_method: z.enum(["upi", "card", "netbanking"]),
  coupon_code: z.string().optional(),
  shipping_address: z.object({
    name: z.string().min(1),
    phone: z.string().min(10),
    address: z.string().min(3),
    landmark: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(6),
  }),
});

const verifySchema = checkoutSchema.extend({
  gateway_order_id: z.string().min(1),
  gateway_payment_id: z.string().min(1),
  signature: z.string().min(1),
});

export const createRazorpayOrderHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const parsed = checkoutSchema.parse(req.body ?? {});
    const out = await createRazorpayOrder({
      userId: req.auth.sub,
      email: req.auth.email,
      paymentMethod: parsed.payment_method,
      shippingAddress: parsed.shipping_address,
      couponCode: parsed.coupon_code,
    });
    res.status(201).json(out);
  } catch (err) {
    next(err);
  }
};

export const retryRazorpayOrderHandler = createRazorpayOrderHandler;

export const verifyRazorpayPaymentHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const parsed = verifySchema.parse(req.body ?? {});
    const order = await verifyRazorpayPaymentAndCreateOrder({
      userId: req.auth.sub,
      email: req.auth.email,
      paymentMethod: parsed.payment_method,
      shippingAddress: parsed.shipping_address,
      couponCode: parsed.coupon_code,
      gatewayOrderId: parsed.gateway_order_id,
      gatewayPaymentId: parsed.gateway_payment_id,
      signature: parsed.signature,
    });
    res.json({ ok: true, order });
  } catch (err) {
    next(err);
  }
};

export const markRazorpayFailureHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth) throw new HttpError(401, "Unauthorized");
    const body = req.body as {
      gateway_order_id?: string;
      gateway_payment_id?: string;
      reason?: string;
    };
    if (!body.gateway_order_id) throw new HttpError(400, "gateway_order_id required");
    await recordPaymentFailure({
      userId: req.auth.sub,
      gatewayOrderId: body.gateway_order_id,
      gatewayPaymentId: body.gateway_payment_id,
      reason: body.reason,
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const razorpayWebhookHandler: RequestHandler = async (req, res, next) => {
  try {
    const raw = req.body as Buffer;
    if (!Buffer.isBuffer(raw)) throw new HttpError(400, "Raw body required");
    const signature = req.header("x-razorpay-signature") || undefined;
    await handleRazorpayWebhook(raw, signature);
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

