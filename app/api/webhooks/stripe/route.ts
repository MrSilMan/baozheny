import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { logStripeEvent, logger } from "@/lib/logger";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    logger.error("stripe.webhook_failure", { event: "signature_check", error: err });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  logStripeEvent(event.type, { id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const type = session.metadata?.type;

        if (type === "wallet_top_up") {
          const userId = session.metadata?.userId;
          const amountUSD = parseFloat(session.metadata?.amountUSD ?? "0");

          if (!userId || !amountUSD) break;

          await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
              where: { id: userId },
              select: { balance: true },
            });

            if (!user) throw new Error(`User ${userId} not found`);

            const balanceBefore = Number(user.balance);
            const balanceAfter = balanceBefore + amountUSD;

            await tx.user.update({
              where: { id: userId },
              data: { balance: balanceAfter },
            });

            await tx.walletTransaction.create({
              data: {
                userId,
                type: "TOP_UP",
                amountUSD,
                balanceBefore,
                balanceAfter,
                stripePaymentIntentId: session.payment_intent as string | null,
                note: `Wallet top-up via Stripe. Session: ${session.id}`,
              },
            });

            await tx.notification.create({
              data: {
                userId,
                type: "WALLET_CREDITED",
                title: "Wallet Credited",
                body: `$${amountUSD.toFixed(2)} added to your wallet. New balance: $${balanceAfter.toFixed(2)}`,
                link: "/buyer/wallet",
              },
            });
          });

          logger.info("wallet.credited", { userId, amountUSD });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.error("stripe.webhook_failure", {
          event: "payment_failed",
          error: paymentIntent.last_payment_error?.message,
          paymentIntentId: paymentIntent.id,
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("stripe.webhook_failure", { event: event.type, error: err });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
