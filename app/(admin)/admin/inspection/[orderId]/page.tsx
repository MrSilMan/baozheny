import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { InspectionForm } from "@/components/admin/inspection-form";

export default async function AdminInspectionDetailPage({
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

  const order = await prisma.procurementOrder.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { name: true, email: true } },
      warehouseItem: {
        include: { inspectionReport: true },
      },
    },
  });

  if (!order) notFound();
  if (!order.warehouseItem) notFound();

  // If already inspected, redirect to order detail
  if (order.warehouseItem.inspectionReport) {
    redirect(`/admin/orders/${orderId}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/inspection">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold">Inspect Item</h1>
          <p className="text-sm text-muted-foreground">
            {order.productName} · Buyer: {order.buyer.name ?? order.buyer.email}
          </p>
        </div>
        <Badge variant="destructive">Pending</Badge>
      </div>

      {/* Item summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Warehouse Item</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">SKU</p>
            <p className="font-medium">{order.warehouseItem.sku ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Received</p>
            <p className="font-medium">
              {format(order.warehouseItem.receivedAt, "MMM d, yyyy")}
            </p>
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
            <p className="text-muted-foreground">Quantity ordered</p>
            <p className="font-medium">{order.quantity}</p>
          </div>
          {order.productUrl && (
            <div className="col-span-2">
              <p className="text-muted-foreground">Source URL</p>
              <a
                href={order.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all text-xs"
              >
                {order.productUrl}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection form */}
      <InspectionForm
        warehouseItemId={order.warehouseItem.id}
        orderId={orderId}
      />
    </div>
  );
}
