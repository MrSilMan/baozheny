"use server";

import * as Sentry from "@sentry/nextjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  submitInspectionSchema,
  type SubmitInspectionInput,
} from "@/lib/validations/inspection.schema";
import type { ActionResponse } from "@/types/actions";
import type { InspectionReport } from "@prisma/client";

export async function submitInspectionReport(
  input: SubmitInspectionInput
): Promise<ActionResponse<InspectionReport>> {
  return Sentry.withServerActionInstrumentation("submitInspectionReport", {}, async () => {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
      return { success: false, error: "Forbidden" };
    }

    const parsed = submitInspectionSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message };
    }

    const { warehouseItemId, result, overallNotes, checkItems } = parsed.data;

    const warehouseItem = await prisma.warehouseItem.findUnique({
      where: { id: warehouseItemId },
      select: { buyerId: true, procurementOrderId: true },
    });
    if (!warehouseItem) return { success: false, error: "Warehouse item not found" };

    const report = await prisma.$transaction(async (tx) => {
      const newReport = await tx.inspectionReport.create({
        data: {
          warehouseItemId,
          inspectorId: session.user.id,
          result,
          overallNotes: overallNotes ?? null,
          checkItems: {
            create: checkItems.map((item) => ({
              checkName: item.checkName,
              passed: item.passed,
              notes: item.notes ?? null,
              photoUrls: item.photoUrls,
            })),
          },
        },
      });

      // Advance order status to INSPECTION_DONE
      await tx.procurementOrder.update({
        where: { id: warehouseItem.procurementOrderId },
        data: {
          status: result === "PASSED" || result === "PARTIAL" ? "INSPECTION_DONE" : "INSPECTION_DONE",
        },
      });

      // Notify buyer
      await tx.notification.create({
        data: {
          userId: warehouseItem.buyerId,
          type: result === "FAILED" ? "INSPECTION_FAILED" : "INSPECTION_READY",
          title: result === "FAILED" ? "Inspection Failed" : "Inspection Complete",
          body:
            result === "FAILED"
              ? "One of your items failed quality inspection. Please review the report."
              : `Your item has passed inspection with result: ${result}.`,
          link: `/buyer/orders/${warehouseItem.procurementOrderId}`,
        },
      });

      return newReport;
    });

    if (result === "FAILED") {
      logger.warn("inspection.failed", { warehouseItemId, buyerId: warehouseItem.buyerId });
    } else {
      logger.info("inspection.completed", {
        reportId: report.id,
        result,
        warehouseItemId,
        buyerId: warehouseItem.buyerId,
      });
    }

    return { success: true, data: report };
  });
}
