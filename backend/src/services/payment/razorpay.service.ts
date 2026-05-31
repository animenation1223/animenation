import crypto from "crypto";
import Razorpay from "razorpay";
import { HttpError } from "../../transport/http/middleware/errorHandler";

let razorpayClient: Razorpay | null = null;

function getClient() {
  if (razorpayClient) return razorpayClient;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new HttpError(500, "Razorpay is not configured");
  }
  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  return razorpayClient;
}

export async function createGatewayOrder(input: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getClient();
  const order = await client.orders.create({
    amount: input.amount,
    currency: "INR",
    receipt: input.receipt,
    notes: input.notes,
    payment_capture: true,
  });
  return order;
}

export async function fetchGatewayPayment(paymentId: string) {
  const client = getClient();
  return client.payments.fetch(paymentId);
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new HttpError(500, "RAZORPAY_KEY_SECRET not configured");
  const payload = `${input.orderId}|${input.paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
}

export function verifyWebhookSignature(rawBody: Buffer, signatureHeader?: string) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) throw new HttpError(500, "RAZORPAY_WEBHOOK_SECRET not configured");
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

