import type {
  User,
  Supplier,
  ProcurementOrder,
  WarehouseItem,
  InspectionReport,
  ConsolidationRequest,
  Shipment,
  Carrier,
  WalletTransaction,
  Notification,
} from "@prisma/client";

// ============================================================
// PAGINATION
// ============================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============================================================
// PROCUREMENT ORDER
// ============================================================

export type OrderWithRelations = ProcurementOrder & {
  buyer: Pick<User, "id" | "name" | "email" | "avatarUrl">;
  agent: Pick<User, "id" | "name" | "email"> | null;
  supplier: Pick<Supplier, "id" | "name" | "platform"> | null;
  warehouseItem: WarehouseItem | null;
};

// ============================================================
// WAREHOUSE
// ============================================================

export type WarehouseItemWithRelations = WarehouseItem & {
  order: Pick<ProcurementOrder, "id" | "orderNumber" | "productName" | "buyerId">;
  inspectionReport: InspectionReport | null;
};

// ============================================================
// CONSOLIDATION
// ============================================================

export type ConsolidationWithRelations = ConsolidationRequest & {
  buyer: Pick<User, "id" | "name" | "email">;
  shipment:
    | (Shipment & {
        carrier: Pick<Carrier, "id" | "name" | "code" | "trackingUrlTemplate">;
      })
    | null;
  _count: { items: number };
};

// ============================================================
// WALLET
// ============================================================

export type WalletTransactionRow = Pick<
  WalletTransaction,
  "id" | "type" | "amountUSD" | "balanceBefore" | "balanceAfter" | "note" | "createdAt"
> & {
  order: Pick<ProcurementOrder, "id" | "orderNumber" | "productName"> | null;
};

// ============================================================
// DASHBOARD STATS
// ============================================================

export interface BuyerStats {
  activeOrderCount: number;
  warehouseItemCount: number;
  pendingInspectionCount: number;
  balanceUSD: number;
}

export interface AdminStats {
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  totalWalletBalance: number;
  ordersThisMonth: number;
}

// ============================================================
// UPLOAD
// ============================================================

export interface UploadedFile {
  url: string;
  key: string;
  size: number;
  type: string;
  name: string;
}

// ============================================================
// NAVIGATION
// ============================================================

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string | number;
}

// ============================================================
// NOTIFICATION
// ============================================================

export type NotificationRow = Pick<
  Notification,
  "id" | "type" | "title" | "body" | "read" | "link" | "createdAt"
>;
