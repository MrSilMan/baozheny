import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Package, Warehouse, ClipboardCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { OrderStatus } from "@prisma/client";

const ORDER_STATUSES: OrderStatus[] = [
  "SUBMITTED",
  "PROCURING",
  "ARRIVED_CN",
  "INSPECTION_PENDING",
  "INSPECTION_DONE",
  "STORED",
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { orderId } = await params;

  const order = await prisma.procurementOrder.findUnique({
    where: { id: orderId, buyerId: session.user.id },
    include: {
      warehouseItem: {
        include: {
          inspectionReport: { include: { checkItems: true } },
          consolidationItems: {
            include: {
              consolidation: {
                include: {
                  shipment: { include: { carrier: true, events: { orderBy: { occurredAt: "desc" }, take: 3 } } },
                },
              },
            },
          },
        },
      },
      transactions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!order) notFound();

  const statusIndex = ORDER_STATUSES.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/buyer/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold">{order.productName}</h1>
          <p className="text-sm text-muted-foreground">Order #{order.orderNumber.slice(-8)}</p>
        </div>
        <Badge variant={order.status === "CANCELLED" ? "destructive" : "default"}>
          {order.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Status timeline */}
      {order.status !== "CANCELLED" && order.status !== "DRAFT" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Order Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {ORDER_STATUSES.map((s, i) => (
                <div key={s} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i <= statusIndex ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  />
                  <span
                    className={`text-xs whitespace-nowrap ${
                      i === statusIndex
                        ? "font-semibold text-primary"
                        : i < statusIndex
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {s.replace(/_/g, " ")}
                  </span>
                  {i < ORDER_STATUSES.length - 1 && (
                    <div
                      className={`h-px w-6 ${i < statusIndex ? "bg-primary" : "bg-muted-foreground/20"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order info */}
      <Card>
        <CardHeader>
          <CardTitle>Sourcing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
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
                {order.unitPriceCNY ? `¥${Number(order.unitPriceCNY).toFixed(2)}` : "Pending"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Service Fee (USD)</p>
              <p className="font-medium">
                {order.serviceFeeUSD ? `$${Number(order.serviceFeeUSD).toFixed(2)}` : "—"}
              </p>
            </div>
          </div>
          {order.productUrl && (
            <div>
              <p className="text-muted-foreground">Source URL</p>
              <a
                href={order.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate block"
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
          <Separator />
          <div className="text-xs text-muted-foreground">
            Submitted {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}
          </div>
        </CardContent>
      </Card>

      {/* Warehouse item */}
      {order.warehouseItem && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Warehouse className="h-4 w-4 text-blue-600" />
            <CardTitle>Warehouse</CardTitle>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection report */}
      {order.warehouseItem?.inspectionReport && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-amber-600" />
            <CardTitle>Inspection Report</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={
                  order.warehouseItem.inspectionReport.result === "PASSED"
                    ? "default"
                    : order.warehouseItem.inspectionReport.result === "FAILED"
                    ? "destructive"
                    : "outline"
                }
              >
                {order.warehouseItem.inspectionReport.result}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {format(order.warehouseItem.inspectionReport.createdAt, "MMM d, yyyy")}
              </span>
            </div>
            {order.warehouseItem.inspectionReport.overallNotes && (
              <p className="text-muted-foreground">
                {order.warehouseItem.inspectionReport.overallNotes}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
