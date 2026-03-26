import Stripe from "stripe";
import { logger } from "./logger";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export async function createPaymentIntent(
  amount: number,
  currency = "usd",
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    logger.info("Stripe PaymentIntent created", { id: intent.id, amount });
    return intent;
  } catch (err) {
    logger.error("Stripe PaymentIntent creation failed", { err, amount });
    throw err;
  }
}

export async function createCheckoutSession(params: {
  orderId: string;
  lineItems: Array<{ name: string; amount: number; quantity: number; imageUrl?: string }>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: params.lineItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
        },
        unit_amount: Math.round(item.amount * 100),
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      orderId: params.orderId,
      ...params.metadata,
    },
  });
  logger.info("Stripe Checkout Session created", { id: session.id, orderId: params.orderId });
  return session;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function refundPayment(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount: Math.round(amount * 100) } : {}),
  });
}
