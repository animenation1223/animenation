import type { PaymentMethod } from "@prisma/client";
import { prisma } from "../infra/prisma";
import { HttpError } from "../transport/http/middleware/errorHandler";
import { keysToCamel } from "../lib/case";
import { serializeOrder } from "../lib/serializers";

const SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 79;
const GST_RATE = 0.05;

type CreateOrderBody = {
  order_number?: string;
  items?: unknown;
  total?: number;
  status?: string;
  payment_method: string;
  shipping_address: {
    name: string;
    phone: string;
    address: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  customer_email?: string;
  coupon_code?: string;
  payment_status?: "pending" | "created" | "authorized" | "captured" | "failed" | "refunded";
  payment_gateway?: string;
  payment_order_id?: string;
  payment_id?: string;
};

function computeShipping(subtotal: number) {
  return subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!coupon || !coupon.active) throw new HttpError(400, "Invalid coupon code");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new HttpError(400, "Coupon expired");
  }
  if (subtotal < coupon.minOrder) {
    throw new HttpError(400, `Minimum order ₹${coupon.minOrder} required`);
  }
  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.discount) / 100)
      : coupon.discount;
  return { coupon, discountAmount: Math.min(discount, subtotal) };
}

export async function createOrderForUser(userId: string, email: string, raw: CreateOrderBody) {
  const body = keysToCamel(raw as Record<string, unknown>) as CreateOrderBody & {
    paymentMethod: string;
    shippingAddress: CreateOrderBody["shipping_address"];
    couponCode?: string;
    paymentStatus?: CreateOrderBody["payment_status"];
    paymentGateway?: string;
    paymentOrderId?: string;
    paymentId?: string;
  };

  const paymentMethod = body.paymentMethod as PaymentMethod;
  if (!["cod", "upi", "card", "netbanking"].includes(paymentMethod)) {
    throw new HttpError(400, "Invalid payment method");
  }

  const addr = body.shippingAddress || body.shipping_address;
  if (!addr?.name || !addr?.phone || !addr?.address || !addr?.city || !addr?.state || !addr?.pincode) {
    throw new HttpError(400, "Incomplete shipping address");
  }

  const order = await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({ where: { userId } });
    if (!cartItems.length) throw new HttpError(400, "Cart is empty");

    let subtotal = 0;
    for (const item of cartItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        throw new HttpError(400, `Product unavailable: ${item.title}`);
      }
      if (product.stock < item.quantity) {
        throw new HttpError(400, `Insufficient stock for ${item.title}`);
      }
      subtotal += item.price * item.quantity;
    }

    let discountAmount = 0;
    let couponCode: string | null = null;
    const couponInput = body.couponCode || body.coupon_code;
    if (couponInput) {
      const validated = await validateCoupon(couponInput, subtotal);
      discountAmount = validated.discountAmount;
      couponCode = validated.coupon.code;
      await tx.coupon.update({
        where: { id: validated.coupon.id },
        data: { uses: { increment: 1 } },
      });
    }

    const shippingCost = computeShipping(subtotal);
    const taxable = Math.max(0, subtotal - discountAmount);
    const gstAmount = Math.round(taxable * GST_RATE);
    const total = taxable + shippingCost + gstAmount;

    const orderNumber = body.order_number || `AN${Date.now().toString(36).toUpperCase()}`;

    const created = await tx.order.create({
      data: {
        userId,
        orderNumber,
        subtotal,
        shippingCost,
        gstAmount,
        discountAmount,
        couponCode,
        total,
        status: "pending",
        paymentMethod,
        paymentStatus: (body.paymentStatus || "pending") as any,
        paymentGateway: body.paymentGateway || null,
        paymentOrderId: body.paymentOrderId || null,
        paymentId: body.paymentId || null,
        paymentCapturedAt:
          body.paymentStatus === "captured" || body.paymentStatus === "authorized"
            ? new Date()
            : null,
        customerEmail: body.customer_email || email,
        shippingName: addr.name,
        shippingPhone: addr.phone,
        shippingAddr: addr.address,
        shippingLandmark: addr.landmark || null,
        shippingCity: addr.city,
        shippingState: addr.state,
        shippingPincode: addr.pincode,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            imageUrl: item.imageUrl,
          })),
        },
      } as any,
      include: { items: true },
    });

    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { userId } });

    const points = Math.floor(total / 100) * 10;
    const loyalty = await tx.loyaltyAccount.findUnique({ where: { userId } });
    if (loyalty && points > 0) {
      await tx.loyaltyAccount.update({
        where: { id: loyalty.id },
        data: { points: { increment: points } },
      });
      await tx.loyaltyTransaction.create({
        data: {
          accountId: loyalty.id,
          type: "purchase",
          delta: points,
          meta: { orderId: created.id, total },
        },
      });
    }

    const priorOrders = await tx.order.count({ where: { userId, id: { not: created.id } } });
    if (priorOrders === 0 && loyalty) {
      await tx.loyaltyAccount.update({
        where: { id: loyalty.id },
        data: { points: { increment: 250 } },
      });
      await tx.loyaltyTransaction.create({
        data: { accountId: loyalty.id, type: "first_order", delta: 250 },
      });
    }

    return created;
  });

  return serializeOrder(order);
}
