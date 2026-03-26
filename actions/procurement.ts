"use server";

import * as Sentry from "@sentry/nextjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  submitOrderSchema,
  updateOrderStatusSchema,
  type SubmitOrderInput,
  type UpdateOrderStatusInput,
} from "@/lib/validations/order.schema";
import type { ActionResponse } from "@/types/actions";
import type { ProcurementOrder } from "@prisma/client";

export async function submitOrder(
  input: SubmitOrderInput
): Promise<ActionResponse<ProcurementOrder>> {
  return Sentry.withServerActionInstrumentation("submitOrder", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const parsed = submitOrderSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const { productName, productUrl, platform, productDescription, quantity, specNotes, imageUrls } =
      parsed.data;

    const order = await prisma.procurementOrder.create({
      data: {
        buyerId: session.user.id,
        status: "SUBMITTED",
        productName,
        productUrl: productUrl || null,
        platform: platform ?? null,
        productDescription: productDescription ?? null,
        quantity,
        specNotes: specNotes ?? null,
        imageUrls: imageUrls ?? [],
      },
    });

    logger.info("order.status_change", {
      orderId: order.id,
      from: "DRAFT",
      to: "SUBMITTED",
      buyerId: session.user.id,
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "ORDER_UPDATE",
        title: "Order Submitted",
        body: `Your sourcing request for "${productName}" has been submitted.`,
        link: `/buyer/orders/${order.id}`,
      },
    });

    return { success: true, data: order };
  });
}

export async function updateOrderStatus(
  input: UpdateOrderStatusInput
): Promise<ActionResponse<ProcurementOrder>> {
  return Sentry.withServerActionInstrumentation("updateOrderStatus", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
      return { success: false, error: "Forbidden" };
    }

    const parsed = updateOrderStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const { orderId, status, agentId, agentNotes, unitPriceCNY, serviceFeeUSD } = parsed.data;

    const existing = await prisma.procurementOrder.findUnique({
      where: { id: orderId },
      select: { status: true, buyerId: true, productName: true },
    });
    if (!existing) return { success: false, error: "Order not found" };

    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.procurementOrder.update({
        where: { id: orderId },
        data: {
          status,
          ...(agentId ? { assignedAgentId: agentId } : {}),
          ...(agentNotes ? { agentNotes } : {}),
          ...(unitPriceCNY !== undefined ? { unitPriceCNY } : {}),
          ...(serviceFeeUSD !== undefined ? { serviceFeeUSD } : {}),
        },
      });

      // Auto-create WarehouseItem when order arrives in China
      if (status === "ARRIVED_CN") {
        await tx.warehouseItem.create({
          data: {
            procurementOrderId: orderId,
            buyerId: existing.buyerId,
            status: "AWAITING",
          },
        });
      }

      // Notify buyer of status changes
      if (status !== "PROCURING") {
        await tx.notification.create({
          data: {
            userId: existing.buyerId,
            type: "ORDER_UPDATE",
            title: `Order Update: ${status.replace(/_/g, " ")}`,
            body: `Your order "${existing.productName}" status has been updated.`,
            link: `/buyer/orders/${orderId}`,
          },
        });
      }

      return updated;
    });

    logger.info("order.status_change", {
      orderId,
      from: existing.status,
      to: status,
      agentId: session.user.id,
    });

    return { success: true, data: order };
  });
}

export async function getOrder(orderId: string): Promise<ActionResponse<ProcurementOrder>> {
  return Sentry.withServerActionInstrumentation("getOrder", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "AGENT";

    const order = await prisma.procurementOrder.findUnique({
      where: {
        id: orderId,
        ...(!isAdmin ? { buyerId: session.user.id } : {}),
      },
    });

    if (!order) return { success: false, error: "Order not found" };
    return { success: true, data: order };
  });
}
