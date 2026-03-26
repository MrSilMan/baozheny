import { prisma } from "./prisma";
import { logger } from "./logger";
import type { NotificationType } from "@prisma/client";

export type AuditAction =
  | "USER_REGISTERED"
  | "USER_UPDATED"
  | "USER_BANNED"
  | "USER_ROLE_CHANGED"
  | "ORDER_CREATED"
  | "ORDER_STATUS_UPDATED"
  | "ORDER_CANCELLED"
  | "WALLET_TOP_UP"
  | "WALLET_DEBIT"
  | "WALLET_CREDIT"
  | "INSPECTION_SUBMITTED"
  | "CONSOLIDATION_REQUESTED"
  | "CONSOLIDATION_STATUS_UPDATED"
  | "SHIPMENT_CREATED"
  | "SHIPMENT_UPDATED";

export async function createAuditLog(params: {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata as object | undefined,
        ip: params.ip,
      },
    });
  } catch (err) {
    logger.error("Failed to create audit log", { err, action: params.action });
  }
}

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link,
      },
    });
  } catch (err) {
    logger.error("Failed to create notification", { err, userId: params.userId });
  }
}
