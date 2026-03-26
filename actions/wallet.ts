"use server";

import * as Sentry from "@sentry/nextjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { topUpSchema } from "@/lib/validations/wallet.schema";
import type { ActionResponse } from "@/types/actions";

export async function createTopUpSession(
  amountUSD: number
): Promise<ActionResponse<{ url: string }>> {
  return Sentry.withServerActionInstrumentation("createTopUpSession", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const parsed = topUpSchema.safeParse({ amountUSD });
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "BaoZhen Wallet Top-up",
              description: `Add $${amountUSD.toFixed(2)} to your BaoZhen wallet`,
            },
            unit_amount: Math.round(amountUSD * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "wallet_top_up",
        userId: session.user.id,
        amountUSD: amountUSD.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/buyer/wallet?top_up=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/buyer/wallet/top-up`,
    });

    if (!checkoutSession.url) {
      return { success: false, error: "Failed to create payment session" };
    }

    return { success: true, data: { url: checkoutSession.url } };
  });
}

export async function getWalletBalance(): Promise<ActionResponse<number>> {
  return Sentry.withServerActionInstrumentation("getWalletBalance", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balance: true },
    });

    return { success: true, data: Number(user?.balance ?? 0) };
  });
}

export async function debitWallet(params: {
  userId: string;
  amountUSD: number;
  type: "PROCUREMENT" | "FEE" | "SHIPPING_ESTIMATE";
  relatedOrderId?: string;
  note?: string;
}): Promise<ActionResponse<void>> {
  return Sentry.withServerActionInstrumentation("debitWallet", {}, async () => {
    const { userId, amountUSD, type, relatedOrderId, note } = params;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });

      if (!user) throw new Error("User not found");

      const balanceBefore = Number(user.balance);
      if (balanceBefore < amountUSD) {
        throw new Error("Insufficient balance");
      }

      const balanceAfter = balanceBefore - amountUSD;

      await tx.user.update({
        where: { id: userId },
        data: { balance: balanceAfter },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type,
          amountUSD,
          balanceBefore,
          balanceAfter,
          relatedOrderId: relatedOrderId ?? null,
          note: note ?? null,
        },
      });

      return { balanceBefore, balanceAfter };
    });

    logger.info("wallet.debit", {
      userId,
      amount: amountUSD,
      balanceBefore: result.balanceBefore,
      balanceAfter: result.balanceAfter,
      reason: note,
    });

    return { success: true, data: undefined };
  });
}

export async function creditWallet(params: {
  userId: string;
  amountUSD: number;
  type: "TOP_UP" | "REFUND" | "ADJUSTMENT";
  stripePaymentIntentId?: string;
  note?: string;
}): Promise<ActionResponse<void>> {
  return Sentry.withServerActionInstrumentation("creditWallet", {}, async () => {
    const { userId, amountUSD, type, stripePaymentIntentId, note } = params;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      });

      if (!user) throw new Error("User not found");

      const balanceBefore = Number(user.balance);
      const balanceAfter = balanceBefore + amountUSD;

      await tx.user.update({
        where: { id: userId },
        data: { balance: balanceAfter },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type,
          amountUSD,
          balanceBefore,
          balanceAfter,
          stripePaymentIntentId: stripePaymentIntentId ?? null,
          note: note ?? null,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: "WALLET_CREDITED",
          title: "Wallet Credited",
          body: `$${amountUSD.toFixed(2)} has been added to your wallet. New balance: $${balanceAfter.toFixed(2)}`,
          link: "/buyer/wallet",
        },
      });
    });

    logger.info("wallet.credit", {
      userId,
      amount: amountUSD,
      reason: note,
    });

    return { success: true, data: undefined };
  });
}
