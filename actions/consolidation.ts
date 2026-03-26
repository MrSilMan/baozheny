"use server";

import * as Sentry from "@sentry/nextjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  createConsolidationSchema,
  type CreateConsolidationInput,
} from "@/lib/validations/consolidation.schema";
import type { ActionResponse } from "@/types/actions";
import type { ConsolidationRequest } from "@prisma/client";

export async function requestConsolidation(
  input: CreateConsolidationInput
): Promise<ActionResponse<ConsolidationRequest>> {
  return Sentry.withServerActionInstrumentation("requestConsolidation", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const parsed = createConsolidationSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const { warehouseItemIds, addressId, serviceAddons, packagingNotes } = parsed.data;

    // Verify all items belong to this buyer and are in STORED status
    const items = await prisma.warehouseItem.findMany({
      where: {
        id: { in: warehouseItemIds },
        buyerId: session.user.id,
        status: "STORED",
      },
    });

    if (items.length !== warehouseItemIds.length) {
      return {
        success: false,
        error: "Some items are not available for consolidation",
      };
    }

    const consolidation = await prisma.$transaction(async (tx) => {
      const request = await tx.consolidationRequest.create({
        data: {
          buyerId: session.user.id,
          addressId,
          status: "REQUESTED",
          serviceAddons,
          packagingNotes: packagingNotes ?? null,
          items: {
            create: warehouseItemIds.map((id) => ({ warehouseItemId: id })),
          },
        },
      });

      // Mark items as IN_CONSOLIDATION
      await tx.warehouseItem.updateMany({
        where: { id: { in: warehouseItemIds } },
        data: { status: "IN_CONSOLIDATION", consolidationId: request.id },
      });

      return request;
    });

    logger.info("consolidation.requested", {
      consolidationId: consolidation.id,
      buyerId: session.user.id,
      itemCount: warehouseItemIds.length,
    });

    return { success: true, data: consolidation };
  });
}

export async function updateConsolidationStatus(params: {
  consolidationId: string;
  status: "CONFIRMED" | "PACKED" | "HANDED_OFF";
  agentNotes?: string;
  estimatedWeightKg?: number;
}): Promise<ActionResponse<ConsolidationRequest>> {
  return Sentry.withServerActionInstrumentation("updateConsolidationStatus", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
      return { success: false, error: "Forbidden" };
    }

    const { consolidationId, status, agentNotes, estimatedWeightKg } = params;

    const consolidation = await prisma.consolidationRequest.update({
      where: { id: consolidationId },
      data: {
        status,
        ...(agentNotes ? { agentNotes } : {}),
        ...(estimatedWeightKg !== undefined ? { estimatedWeightKg } : {}),
        ...(status === "CONFIRMED" ? { confirmedAt: new Date() } : {}),
        ...(status === "HANDED_OFF" ? { handedOffAt: new Date() } : {}),
      },
    });

    if (status === "HANDED_OFF") {
      logger.info("consolidation.handed_off", {
        consolidationId,
        agentId: session.user.id,
      });
    }

    return { success: true, data: consolidation };
  });
}
