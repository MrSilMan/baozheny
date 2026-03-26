import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BaoZhen v2 database...");

  // ============================================================
  // USERS
  // ============================================================
  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const buyerHash = await bcrypt.hash("Buyer@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@baozhen.com" },
    update: {},
    create: {
      name: "BaoZhen Admin",
      email: "admin@baozhen.com",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
      balance: 0,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@baozhen.com" },
    update: {},
    create: {
      name: "Li Wei (Agent)",
      email: "agent@baozhen.com",
      passwordHash,
      role: "AGENT",
      emailVerified: new Date(),
      balance: 0,
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: "buyer@baozhen.com" },
    update: {},
    create: {
      name: "Sarah Johnson",
      email: "buyer@baozhen.com",
      passwordHash: buyerHash,
      role: "BUYER",
      emailVerified: new Date(),
      balance: 250.0,
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: "buyer2@baozhen.com" },
    update: {},
    create: {
      name: "Marcus Chen",
      email: "buyer2@baozhen.com",
      passwordHash: buyerHash,
      role: "BUYER",
      emailVerified: new Date(),
      balance: 100.0,
    },
  });

  // ============================================================
  // ADDRESSES
  // ============================================================
  let address1 = await prisma.address.findFirst({ where: { userId: buyer1.id } });
  if (!address1) {
    address1 = await prisma.address.create({
      data: {
        userId: buyer1.id,
        fullName: "Sarah Johnson",
        line1: "123 Main Street",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
        isDefault: true,
      },
    });
  }

  let address2 = await prisma.address.findFirst({ where: { userId: buyer2.id } });
  if (!address2) {
    address2 = await prisma.address.create({
      data: {
        userId: buyer2.id,
        fullName: "Marcus Chen",
        line1: "456 Queen Street",
        city: "Toronto",
        state: "ON",
        postalCode: "M5H 2N2",
        country: "CA",
        isDefault: true,
      },
    });
  }

  // ============================================================
  // CARRIERS
  // ============================================================
  const dhl = await prisma.carrier.upsert({
    where: { code: "DHL" },
    update: {},
    create: {
      name: "DHL Express",
      code: "DHL",
      trackingUrlTemplate: "https://www.dhl.com/en/express/tracking.html?AWB={number}&brand=DHL",
      active: true,
    },
  });

  const fedex = await prisma.carrier.upsert({
    where: { code: "FEDEX" },
    update: {},
    create: {
      name: "FedEx International",
      code: "FEDEX",
      trackingUrlTemplate: "https://www.fedex.com/fedextrack/?trknbr={number}",
      active: true,
    },
  });

  await prisma.carrier.upsert({
    where: { code: "EMS" },
    update: {},
    create: {
      name: "EMS China Post",
      code: "EMS",
      trackingUrlTemplate: "https://www.17track.net/en/track#{number}",
      active: true,
    },
  });

  await prisma.carrier.upsert({
    where: { code: "SF" },
    update: {},
    create: {
      name: "SF Express",
      code: "SF",
      trackingUrlTemplate: "https://www.sf-express.com/us/en/dynamic_function/waybill/#search/bill-number/{number}",
      active: true,
    },
  });

  // ============================================================
  // SERVICE FEE CONFIG
  // ============================================================
  const feeConfigs = [
    { serviceType: "PROCUREMENT" as const, baseFeeUSD: 5.00, description: "5% of item CNY value (minimum $5)" },
    { serviceType: "QUALITY_INSPECTION" as const, baseFeeUSD: 3.00, description: "Flat fee per item inspected" },
    { serviceType: "WAREHOUSING" as const, baseFeeUSD: 0.05, description: "Per item per day after 30-day free period" },
    { serviceType: "CONSOLIDATION" as const, baseFeeUSD: 8.00, description: "Flat handling fee per consolidated package" },
    { serviceType: "LABELING" as const, baseFeeUSD: 2.00, description: "Custom label printing and application per item" },
    { serviceType: "REPACKAGING" as const, baseFeeUSD: 4.00, description: "Repackage into neutral or branded box" },
  ];

  for (const config of feeConfigs) {
    await prisma.serviceFeeConfig.upsert({
      where: { serviceType: config.serviceType },
      update: {},
      create: config,
    });
  }

  // ============================================================
  // PROCUREMENT ORDERS — various stages
  // ============================================================

  // Order 1: STORED (full workflow complete)
  const order1 = await prisma.procurementOrder.upsert({
    where: { orderNumber: "BZ-SEED-001" },
    update: {},
    create: {
      orderNumber: "BZ-SEED-001",
      buyerId: buyer1.id,
      assignedAgentId: agent.id,
      status: "STORED",
      platform: "ALI1688",
      productUrl: "https://detail.1688.com/offer/123456789.html",
      productName: "Ceramic Coffee Mug Set (12 pcs, 350ml)",
      productDescription: "High-quality ceramic mugs with bamboo lids. White matte finish.",
      quantity: 2,
      unitPriceCNY: 68.00,
      totalPriceCNY: 136.00,
      serviceFeeUSD: 5.00,
      imageUrls: [],
    },
  });

  // Order 2: INSPECTION_PENDING
  const order2 = await prisma.procurementOrder.upsert({
    where: { orderNumber: "BZ-SEED-002" },
    update: {},
    create: {
      orderNumber: "BZ-SEED-002",
      buyerId: buyer1.id,
      assignedAgentId: agent.id,
      status: "INSPECTION_PENDING",
      platform: "TAOBAO",
      productName: "Bamboo Cutting Board Set (3 sizes)",
      productDescription: "Organic bamboo cutting boards, food-safe finish.",
      quantity: 5,
      unitPriceCNY: 45.00,
      totalPriceCNY: 225.00,
      serviceFeeUSD: 8.00,
      imageUrls: [],
    },
  });

  // Order 3: PROCURING
  const order3 = await prisma.procurementOrder.upsert({
    where: { orderNumber: "BZ-SEED-003" },
    update: {},
    create: {
      orderNumber: "BZ-SEED-003",
      buyerId: buyer1.id,
      status: "PROCURING",
      platform: "PINDUODUO",
      productName: "LED Desk Lamp with USB Charging Port",
      productDescription: "5W LED, adjustable brightness, 3 color modes.",
      quantity: 10,
      imageUrls: [],
    },
  });

  // Order 4: SUBMITTED (buyer2)
  const order4 = await prisma.procurementOrder.upsert({
    where: { orderNumber: "BZ-SEED-004" },
    update: {},
    create: {
      orderNumber: "BZ-SEED-004",
      buyerId: buyer2.id,
      status: "SUBMITTED",
      platform: "ALI1688",
      productName: "Stainless Steel Water Bottle 1L",
      productDescription: "Double-wall vacuum insulated, keeps cold 24h / hot 12h.",
      quantity: 50,
      imageUrls: [],
    },
  });

  // ============================================================
  // WAREHOUSE ITEMS
  // ============================================================

  let warehouseItem1 = await prisma.warehouseItem.findUnique({
    where: { procurementOrderId: order1.id },
  });
  if (!warehouseItem1) {
    warehouseItem1 = await prisma.warehouseItem.create({
      data: {
        procurementOrderId: order1.id,
        buyerId: buyer1.id,
        sku: "WH-001-MUG",
        status: "STORED",
        weight: 2400,
        dimensions: { l: 35, w: 25, h: 20 },
        receivedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        storageStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        storageFeePerDay: 0.05,
        photoUrls: [],
      },
    });
  }

  let warehouseItem2 = await prisma.warehouseItem.findUnique({
    where: { procurementOrderId: order2.id },
  });
  if (!warehouseItem2) {
    warehouseItem2 = await prisma.warehouseItem.create({
      data: {
        procurementOrderId: order2.id,
        buyerId: buyer1.id,
        sku: "WH-002-BOARD",
        status: "AWAITING",
        weight: 3200,
        receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        photoUrls: [],
      },
    });
  }

  // ============================================================
  // INSPECTION REPORT (for order1)
  // ============================================================
  const existingReport = await prisma.inspectionReport.findUnique({
    where: { warehouseItemId: warehouseItem1.id },
  });
  if (!existingReport) {
    await prisma.inspectionReport.create({
      data: {
        warehouseItemId: warehouseItem1.id,
        inspectorId: agent.id,
        result: "PASSED",
        overallNotes: "All 12 mugs present, no chips or cracks. Bamboo lids fit securely.",
        checkItems: {
          create: [
            { checkName: "Quantity matches order", passed: true, photoUrls: [] },
            { checkName: "No visible defects", passed: true, photoUrls: [] },
            { checkName: "Packaging intact", passed: true, photoUrls: [] },
            { checkName: "Correct color/finish", passed: true, photoUrls: [] },
          ],
        },
      },
    });
  }

  // ============================================================
  // CONSOLIDATION + SHIPMENT (for order1)
  // ============================================================
  const existingConsolidation = await prisma.consolidationRequest.findFirst({
    where: { buyerId: buyer1.id },
  });

  if (!existingConsolidation) {
    const consolidation = await prisma.consolidationRequest.create({
      data: {
        buyerId: buyer1.id,
        addressId: address1.id,
        status: "HANDED_OFF",
        serviceAddons: ["CONSOLIDATION"],
        estimatedWeightKg: 2.8,
        requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        handedOffAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        items: {
          create: [{ warehouseItemId: warehouseItem1.id }],
        },
      },
    });

    // Update warehouse item
    await prisma.warehouseItem.update({
      where: { id: warehouseItem1.id },
      data: { status: "IN_CONSOLIDATION", consolidationId: consolidation.id },
    });

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        consolidationId: consolidation.id,
        carrierId: dhl.id,
        trackingNumber: "1234567890",
        status: "IN_TRANSIT",
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        handedOffAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    // Shipment events
    await prisma.shipmentEvent.createMany({
      data: [
        {
          shipmentId: shipment.id,
          status: "IN_TRANSIT",
          location: "Frankfurt, Germany",
          description: "Shipment in transit to destination",
          occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          shipmentId: shipment.id,
          status: "PICKED_UP",
          location: "Shenzhen, China",
          description: "Shipment picked up by DHL",
          occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          shipmentId: shipment.id,
          status: "CREATED",
          location: "BaoZhen Warehouse, Guangzhou",
          description: "Label created and shipment handed to carrier",
          occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
        },
      ],
    });
  }

  // ============================================================
  // WALLET TRANSACTIONS
  // ============================================================
  const existingTx = await prisma.walletTransaction.findFirst({
    where: { userId: buyer1.id },
  });

  if (!existingTx) {
    await prisma.walletTransaction.createMany({
      data: [
        {
          userId: buyer1.id,
          type: "TOP_UP",
          amountUSD: 300.00,
          balanceBefore: 0,
          balanceAfter: 300.00,
          stripePaymentIntentId: "pi_seed_001",
          note: "Initial wallet top-up",
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
        {
          userId: buyer1.id,
          type: "PROCUREMENT",
          amountUSD: 50.00,
          balanceBefore: 300.00,
          balanceAfter: 250.00,
          relatedOrderId: order1.id,
          note: "Procurement service fee for Ceramic Coffee Mug Set",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: buyer1.id,
        type: "ORDER_UPDATE",
        title: "Order Stored",
        body: 'Your Ceramic Coffee Mug Set is now stored at our warehouse.',
        link: `/buyer/orders/${order1.id}`,
        read: false,
      },
      {
        userId: buyer1.id,
        type: "INSPECTION_READY",
        title: "Inspection Complete",
        body: 'Your Ceramic Coffee Mug Set passed inspection.',
        link: `/buyer/orders/${order1.id}`,
        read: true,
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("");
  console.log("Test accounts:");
  console.log("  Admin:  admin@baozhen.com  / Admin@12345");
  console.log("  Agent:  agent@baozhen.com  / Admin@12345");
  console.log("  Buyer:  buyer@baozhen.com  / Buyer@12345");
  console.log("  Buyer2: buyer2@baozhen.com / Buyer@12345");
  console.log("");
  console.log("Public tracking: /tracking/1234567890");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
