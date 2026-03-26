-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'PROCURING', 'ARRIVED_CN', 'INSPECTION_PENDING', 'INSPECTION_DONE', 'STORED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "ConsolidationStatus" AS ENUM ('DRAFT', 'REQUESTED', 'CONFIRMED', 'PACKED', 'HANDED_OFF');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TOP_UP', 'PROCUREMENT', 'FEE', 'REFUND', 'SHIPPING_ESTIMATE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PROCUREMENT', 'QUALITY_INSPECTION', 'WAREHOUSING', 'CONSOLIDATION', 'LABELING', 'REPACKAGING');

-- CreateEnum
CREATE TYPE "SupplierPlatform" AS ENUM ('TAOBAO', 'PINDUODUO', 'ALI1688', 'WECHAT', 'OTHER');

-- CreateEnum
CREATE TYPE "WarehouseItemStatus" AS ENUM ('AWAITING', 'STORED', 'IN_CONSOLIDATION', 'SHIPPED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_UPDATE', 'INSPECTION_READY', 'INSPECTION_FAILED', 'SHIPMENT_UPDATE', 'WALLET_CREDITED', 'WALLET_DEBITED', 'CONSOLIDATION_READY', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "avatarUrl" TEXT,
    "phone" TEXT,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "SupplierPlatform" NOT NULL,
    "wechatId" TEXT,
    "city" TEXT,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "supplierId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "platform" "SupplierPlatform",
    "productUrl" TEXT,
    "productName" TEXT NOT NULL,
    "productDescription" TEXT,
    "imageUrls" TEXT[],
    "specNotes" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPriceCNY" DECIMAL(12,2),
    "totalPriceCNY" DECIMAL(12,2),
    "serviceFeeUSD" DECIMAL(12,2),
    "agentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_items" (
    "id" TEXT NOT NULL,
    "procurementOrderId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sku" TEXT,
    "status" "WarehouseItemStatus" NOT NULL DEFAULT 'AWAITING',
    "weight" DECIMAL(10,3),
    "dimensions" JSONB,
    "photoUrls" TEXT[],
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storageStartDate" TIMESTAMP(3),
    "storageFeePerDay" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "consolidationId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_fee_logs" (
    "id" TEXT NOT NULL,
    "warehouseItemId" TEXT NOT NULL,
    "chargedDate" TIMESTAMP(3) NOT NULL,
    "amountUSD" DECIMAL(10,4) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_fee_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_reports" (
    "id" TEXT NOT NULL,
    "warehouseItemId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "result" "InspectionResult" NOT NULL DEFAULT 'PENDING',
    "overallNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_check_items" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "checkName" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "photoUrls" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_check_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consolidation_requests" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "status" "ConsolidationStatus" NOT NULL DEFAULT 'DRAFT',
    "serviceAddons" "ServiceType"[],
    "estimatedWeightKg" DECIMAL(10,3),
    "packagingNotes" TEXT,
    "agentNotes" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "handedOffAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consolidation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consolidation_items" (
    "id" TEXT NOT NULL,
    "consolidationId" TEXT NOT NULL,
    "warehouseItemId" TEXT NOT NULL,

    CONSTRAINT "consolidation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "trackingUrlTemplate" TEXT NOT NULL,
    "logoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "consolidationId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "labelUrl" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "estimatedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "handedOffAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_events" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amountUSD" DECIMAL(12,2) NOT NULL,
    "balanceBefore" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "relatedOrderId" TEXT,
    "stripePaymentIntentId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalUSD" DECIMAL(12,2) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_fee_configs" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "baseFeeUSD" DECIMAL(12,4) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_fee_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE INDEX "suppliers_platform_idx" ON "suppliers"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_orders_orderNumber_key" ON "procurement_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "procurement_orders_buyerId_idx" ON "procurement_orders"("buyerId");

-- CreateIndex
CREATE INDEX "procurement_orders_assignedAgentId_idx" ON "procurement_orders"("assignedAgentId");

-- CreateIndex
CREATE INDEX "procurement_orders_status_idx" ON "procurement_orders"("status");

-- CreateIndex
CREATE INDEX "procurement_orders_createdAt_idx" ON "procurement_orders"("createdAt");

-- CreateIndex
CREATE INDEX "procurement_orders_orderNumber_idx" ON "procurement_orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_items_procurementOrderId_key" ON "warehouse_items"("procurementOrderId");

-- CreateIndex
CREATE INDEX "warehouse_items_buyerId_idx" ON "warehouse_items"("buyerId");

-- CreateIndex
CREATE INDEX "warehouse_items_status_idx" ON "warehouse_items"("status");

-- CreateIndex
CREATE INDEX "warehouse_items_consolidationId_idx" ON "warehouse_items"("consolidationId");

-- CreateIndex
CREATE INDEX "storage_fee_logs_warehouseItemId_idx" ON "storage_fee_logs"("warehouseItemId");

-- CreateIndex
CREATE INDEX "storage_fee_logs_chargedDate_idx" ON "storage_fee_logs"("chargedDate");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_reports_warehouseItemId_key" ON "inspection_reports"("warehouseItemId");

-- CreateIndex
CREATE INDEX "inspection_reports_warehouseItemId_idx" ON "inspection_reports"("warehouseItemId");

-- CreateIndex
CREATE INDEX "inspection_reports_inspectorId_idx" ON "inspection_reports"("inspectorId");

-- CreateIndex
CREATE INDEX "inspection_reports_result_idx" ON "inspection_reports"("result");

-- CreateIndex
CREATE INDEX "inspection_check_items_reportId_idx" ON "inspection_check_items"("reportId");

-- CreateIndex
CREATE INDEX "consolidation_requests_buyerId_idx" ON "consolidation_requests"("buyerId");

-- CreateIndex
CREATE INDEX "consolidation_requests_status_idx" ON "consolidation_requests"("status");

-- CreateIndex
CREATE INDEX "consolidation_requests_requestedAt_idx" ON "consolidation_requests"("requestedAt");

-- CreateIndex
CREATE INDEX "consolidation_items_consolidationId_idx" ON "consolidation_items"("consolidationId");

-- CreateIndex
CREATE INDEX "consolidation_items_warehouseItemId_idx" ON "consolidation_items"("warehouseItemId");

-- CreateIndex
CREATE UNIQUE INDEX "consolidation_items_consolidationId_warehouseItemId_key" ON "consolidation_items"("consolidationId", "warehouseItemId");

-- CreateIndex
CREATE UNIQUE INDEX "carriers_code_key" ON "carriers"("code");

-- CreateIndex
CREATE INDEX "carriers_active_idx" ON "carriers"("active");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_consolidationId_key" ON "shipments"("consolidationId");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "shipments_trackingNumber_idx" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_carrierId_idx" ON "shipments"("carrierId");

-- CreateIndex
CREATE INDEX "shipment_events_shipmentId_idx" ON "shipment_events"("shipmentId");

-- CreateIndex
CREATE INDEX "shipment_events_occurredAt_idx" ON "shipment_events"("occurredAt");

-- CreateIndex
CREATE INDEX "wallet_transactions_userId_idx" ON "wallet_transactions"("userId");

-- CreateIndex
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "wallet_transactions_createdAt_idx" ON "wallet_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "invoices_userId_idx" ON "invoices"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "service_fee_configs_serviceType_key" ON "service_fee_configs"("serviceType");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_orders" ADD CONSTRAINT "procurement_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_procurementOrderId_fkey" FOREIGN KEY ("procurementOrderId") REFERENCES "procurement_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_items" ADD CONSTRAINT "warehouse_items_consolidationId_fkey" FOREIGN KEY ("consolidationId") REFERENCES "consolidation_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_fee_logs" ADD CONSTRAINT "storage_fee_logs_warehouseItemId_fkey" FOREIGN KEY ("warehouseItemId") REFERENCES "warehouse_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_reports" ADD CONSTRAINT "inspection_reports_warehouseItemId_fkey" FOREIGN KEY ("warehouseItemId") REFERENCES "warehouse_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_reports" ADD CONSTRAINT "inspection_reports_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_check_items" ADD CONSTRAINT "inspection_check_items_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "inspection_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consolidation_requests" ADD CONSTRAINT "consolidation_requests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consolidation_requests" ADD CONSTRAINT "consolidation_requests_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consolidation_items" ADD CONSTRAINT "consolidation_items_consolidationId_fkey" FOREIGN KEY ("consolidationId") REFERENCES "consolidation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consolidation_items" ADD CONSTRAINT "consolidation_items_warehouseItemId_fkey" FOREIGN KEY ("warehouseItemId") REFERENCES "warehouse_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_consolidationId_fkey" FOREIGN KEY ("consolidationId") REFERENCES "consolidation_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_relatedOrderId_fkey" FOREIGN KEY ("relatedOrderId") REFERENCES "procurement_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
