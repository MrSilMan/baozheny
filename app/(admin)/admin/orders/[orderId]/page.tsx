import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import type { OrderStatus } from "@prisma/client";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
    redirect("/buyer/dashboard");
  }

  const { orderId } = await params;

  const [order, agents] = await Promise.all([
    prisma.procurementOrder.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { name: true, email: true } },
        agent: { select: { name: true, id: true } },
        supplier: true,
        warehouseItem: {
          include: {
            inspectionReport: { include: { checkItems: true } },
          },
        },
        transactions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "AGENT"] } },
      select: { id: true, name: true },
    }),
  ]);

  if (!order) notFound();

  const statusVariantMap: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
    DRAFT: "secondary",
    SUBMITTED: "outline",
    PROCURING: "outline",
    ARRIVED_CN: "outline",
    INSPECTION_PENDING: "destructive",
    INSPECTION_DONE: "outline",
    STORED: "default",
    CANCELLED: "secondary",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold">{order.productName}</h1>
          <p className="text-sm text-muted-foreground">
            #{order.orderNumber.slice(-8)} · Buyer: {order.buyer.name ?? order.buyer.email}
          </p>
        </div>
        <Badge variant={statusVariantMap[order.status]}>
          {order.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Admin status actions */}
      <OrderStatusActions order={{ id: order.id, status: order.status }} agents={agents} currentAgentId={order.agent?.id} />

      {/* Order info */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground">Buyer</p>
              <p className="font-medium">{order.buyer.name ?? order.buyer.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Platform</p>
              <p className="font-medium">{order.platform ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">{order.quantity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unit Price (CNY)</p>
              <p className="font-medium">
                {order.unitPriceCNY ? `¥${Number(order.unitPriceCNY).toFixed(2)}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Service Fee (USD)</p>
              <p className="font-medium">
                {order.serviceFeeUSD ? `$${Number(order.serviceFeeUSD).toFixed(2)}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Assigned Agent</p>
              <p className="font-medium">{order.agent?.name ?? "Unassigned"}</p>
            </div>
          </div>
          {order.productUrl && (
            <div>
              <p className="text-muted-foreground">Source URL</p>
              <a
                href={order.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {order.productUrl}
              </a>
            </div>
          )}
          {order.productDescription && (
            <div>
              <p className="text-muted-foreground">Description</p>
              <p className="whitespace-pre-wrap">{order.productDescription}</p>
            </div>
          )}
          {order.agentNotes && (
            <div>
              <p className="text-muted-foreground">Agent Notes</p>
              <p className="whitespace-pre-wrap text-amber-700 dark:text-amber-400">
                {order.agentNotes}
              </p>
            </div>
          )}
          <Separator />
          <p className="text-xs text-muted-foreground">
            Created {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </CardContent>
      </Card>

      {/* Warehouse item */}
      {order.warehouseItem && (
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Item</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="outline">{order.warehouseItem.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Weight</p>
                <p className="font-medium">
                  {order.warehouseItem.weight
                    ? `${Number(order.warehouseItem.weight).toFixed(0)}g`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Received</p>
                <p className="font-medium">
                  {format(order.warehouseItem.receivedAt, "MMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">SKU</p>
                <p className="font-medium">{order.warehouseItem.sku ?? "—"}</p>
              </div>
            </div>

            {/* Inspection report */}
            {order.warehouseItem.inspectionReport && (
              <div className="mt-4 pt-4 border-t">
                <p className="font-medium text-sm mb-2">Inspection Report</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={
                      order.warehouseItem.inspectionReport.result === "PASSED"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {order.warehouseItem.inspectionReport.result}
                  </Badge>
                </div>
                {order.warehouseItem.inspectionReport.checkItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs py-1">
                    <span
                      className={item.passed ? "text-green-600" : "text-red-600"}
                    >
                      {item.passed ? "✓" : "✗"}
                    </span>
                    <span>{item.checkName}</span>
                    {item.notes && (
                      <span className="text-muted-foreground">— {item.notes}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
