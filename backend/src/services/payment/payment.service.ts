import type { PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "../../infra/prisma";
import { HttpError } from "../../transport/http/middleware/errorHandler";
import { createOrderForUser } from "../order.service";
import {
  createGatewayOrder,
  fetchGatewayPayment,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from "./razorpay.service";

type ShippingAddress = {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

type InternalPaymentStatus = "pending" | "created" | "authorized" | "captured" | "failed" | "refunded";

type Coupon = { code: string; type: "percent" | "flat"; discount: number; minOrder: number };

function assertOnlineMethod(method: string): method is PaymentMethod {
  return method === "upi" || method === "card" || method === "netbanking";
}

async function validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discountAmount: number }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.active) throw new HttpError(400, "Invalid coupon code");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new HttpError(400, "Coupon expired");
  if (subtotal < coupon.minOrder) throw new HttpError(400, `Minimum order ₹${coupon.minOrder} required`);
  const discountAmount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.discount) / 100)
      : coupon.discount;
  return {
    coupon: {
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      minOrder: coupon.minOrder,
    },
    discountAmount: Math.min(discountAmount, subtotal),
  };
}

async function computeCartAmount(userId: string, couponCode?: string) {
  const cartItems = await prisma.cartItem.findMany({ where: { userId } });
  if (!cartItems.length) throw new HttpError(400, "Cart is empty");

  let subtotal = 0;
  for (const item of cartItems) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.isActive) throw new HttpError(400, `Product unavailable: ${item.title}`);
    if (product.stock < item.quantity) throw new HttpError(400, `Insufficient stock for ${item.title}`);
    subtotal += item.price * item.quantity;
  }

  let discountAmount = 0;
  if (couponCode) {
    const validated = await validateCoupon(couponCode, subtotal);
    discountAmount = validated.discountAmount;
  }

  const shipping = subtotal >= 999 ? 0 : 79;
  const taxable = Math.max(0, subtotal - discountAmount);
  const gst = Math.round(taxable * 0.05);
  const total = taxable + shipping + gst;

  return {
    subtotal,
    shipping,
    gst,
    discountAmount,
    total,
    amountPaise: total * 100,
  };
}

export async function createRazorpayOrder(input: {
  userId: string;
  email: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  couponCode?: string;
}) {
  if (!assertOnlineMethod(input.paymentMethod)) {
    throw new HttpError(400, "Razorpay is only supported for online payment methods");
  }
  const pricing = await computeCartAmount(input.userId, input.couponCode);
  const receipt = `AVP-${Date.now().toString(36).toUpperCase()}`;
  const gatewayOrder = await createGatewayOrder({
    amount: pricing.amountPaise,
    receipt,
    notes: {
      userId: input.userId,
      email: input.email,
    },
  });

  await (prisma as any).paymentTransaction.create({
    data: {
      userId: input.userId,
      paymentMethod: input.paymentMethod,
      gateway: "razorpay",
      gatewayOrderId: gatewayOrder.id,
      amount: pricing.total,
      currency: "INR",
      status: "created",
      metadata: {
        receipt,
        shippingAddress: input.shippingAddress,
        couponCode: input.couponCode ?? null,
      },
    },
  });

  return {
    gateway_order_id: gatewayOrder.id,
    amount: pricing.total,
    amount_paise: pricing.amountPaise,
    currency: "INR",
    key_id: process.env.RAZORPAY_KEY_ID,
  };
}

export async function verifyRazorpayPaymentAndCreateOrder(input: {
  userId: string;
  email: string;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  couponCode?: string;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}) {
  if (!assertOnlineMethod(input.paymentMethod)) {
    throw new HttpError(400, "Invalid payment method");
  }
  const transaction = await (prisma as any).paymentTransaction.findFirst({
    where: {
      userId: input.userId,
      gatewayOrderId: input.gatewayOrderId,
      gateway: "razorpay",
    },
    orderBy: { createdAt: "desc" },
  });
  if (!transaction) throw new HttpError(404, "Payment transaction not found");
  if (transaction.status === "captured" || transaction.status === "authorized") {
    throw new HttpError(409, "Payment already processed");
  }

  const validSignature = verifyCheckoutSignature({
    orderId: input.gatewayOrderId,
    paymentId: input.gatewayPaymentId,
    signature: input.signature,
  });
  if (!validSignature) {
    await (prisma as any).paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "failed",
        gatewayPaymentId: input.gatewayPaymentId,
        failureReason: "Invalid signature",
      },
    });
    throw new HttpError(400, "Invalid payment signature");
  }

  const gatewayPayment = await fetchGatewayPayment(input.gatewayPaymentId);
  if (!gatewayPayment || gatewayPayment.order_id !== input.gatewayOrderId) {
    throw new HttpError(400, "Payment/order mismatch");
  }
  const status = gatewayPayment.status;
  if (status !== "authorized" && status !== "captured") {
    await (prisma as any).paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "failed",
        signatureVerified: true,
        gatewayPaymentId: input.gatewayPaymentId,
        failureReason: `Unexpected gateway status: ${status}`,
      },
    });
    throw new HttpError(400, "Payment not completed");
  }

  const order = await createOrderForUser(input.userId, input.email, {
    payment_method: input.paymentMethod,
    shipping_address: input.shippingAddress,
    coupon_code: input.couponCode,
  });

  const mappedStatus: InternalPaymentStatus = status === "captured" ? "captured" : "authorized";
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: String(order.id) },
      data: {
        paymentStatus: mappedStatus,
        paymentGateway: "razorpay",
        paymentOrderId: input.gatewayOrderId,
        paymentId: input.gatewayPaymentId,
        paymentCapturedAt: status === "captured" ? new Date() : null,
      } as any,
    });
    await (tx as any).paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        orderId: String(order.id),
        gatewayPaymentId: input.gatewayPaymentId,
        signatureVerified: true,
        status: mappedStatus,
        metadata: {
          ...(transaction.metadata as Prisma.JsonObject | null),
          verificationPayload: {
            gatewayOrderId: input.gatewayOrderId,
            gatewayPaymentId: input.gatewayPaymentId,
          },
        },
      },
    });
  });

  return order;
}

export async function recordPaymentFailure(input: {
  userId: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  reason?: string;
}) {
  const transaction = await (prisma as any).paymentTransaction.findFirst({
    where: {
      userId: input.userId,
      gatewayOrderId: input.gatewayOrderId,
      gateway: "razorpay",
    },
    orderBy: { createdAt: "desc" },
  });
  if (!transaction) return;
  await (prisma as any).paymentTransaction.update({
    where: { id: transaction.id },
    data: {
      status: "failed",
      gatewayPaymentId: input.gatewayPaymentId ?? transaction.gatewayPaymentId,
      failureReason: input.reason ?? "Payment failed by user or gateway",
    },
  });
}

export async function handleRazorpayWebhook(rawBody: Buffer, signatureHeader?: string) {
  const verified = verifyWebhookSignature(rawBody, signatureHeader);
  if (!verified) throw new HttpError(400, "Invalid webhook signature");

  const payload = JSON.parse(rawBody.toString("utf8")) as {
    event?: string;
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      order?: { entity?: Record<string, unknown> };
    };
  };
  const event = payload.event || "";
  const payment = payload.payload?.payment?.entity || {};
  const gatewayOrderId = String(payment.order_id || payload.payload?.order?.entity?.id || "");
  const gatewayPaymentId = String(payment.id || "");
  if (!gatewayOrderId) return { ok: true };

  const tx = await (prisma as any).paymentTransaction.findFirst({
    where: { gatewayOrderId, gateway: "razorpay" },
    orderBy: { createdAt: "desc" },
  });
  if (!tx) return { ok: true };

  let nextStatus: InternalPaymentStatus | null = null;
  if (event === "payment.captured") nextStatus = "captured";
  if (event === "payment.authorized") nextStatus = "authorized";
  if (event === "payment.failed") nextStatus = "failed";
  if (event === "payment.refunded") nextStatus = "refunded";
  if (!nextStatus) return { ok: true };

  await (prisma as any).paymentTransaction.update({
    where: { id: tx.id },
    data: {
      status: nextStatus,
      signatureVerified: true,
      gatewayPaymentId: gatewayPaymentId || tx.gatewayPaymentId,
      metadata: {
        ...(tx.metadata as Prisma.JsonObject | null),
        webhookEvent: event,
      },
    },
  });

  if (tx.orderId) {
    await prisma.order.update({
      where: { id: tx.orderId },
      data: {
        paymentStatus: nextStatus,
        paymentGateway: "razorpay",
        paymentOrderId: gatewayOrderId,
        paymentId: gatewayPaymentId || undefined,
        paymentCapturedAt: nextStatus === "captured" ? new Date() : undefined,
      } as any,
    });
  }
  return { ok: true };
}

