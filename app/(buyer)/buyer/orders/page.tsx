import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { OrderStatus } from "@prisma/client";

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

export default async function BuyerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { status } = await searchParams;

  const orders = await prisma.procurementOrder.findMany({
    where: {
      buyerId: session.user.id,
      ...(status ? { status: status as OrderStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      productName: true,
      platform: true,
      quantity: true,
      status: true,
      serviceFeeUSD: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">My Orders</h1>
        <Button asChild>
          <Link href="/buyer/orders/new">
            <Plus className="h-4 w-4 mr-2" /> New Order
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All", value: "" },
          { label: "Active", value: "PROCURING" },
          { label: "In Warehouse", value: "STORED" },
          { label: "Inspection", value: "INSPECTION_PENDING" },
          { label: "Cancelled", value: "CANCELLED" },
        ].map((tab) => (
          <Link key={tab.value} href={tab.value ? `/buyer/orders?status=${tab.value}` : "/buyer/orders"}>
            <Badge
              variant={status === tab.value || (!status && !tab.value) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {tab.label}
            </Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/buyer/orders/${order.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {order.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground">#{order.orderNumber.slice(-8)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {order.platform ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{order.quantity}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[order.status]}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(order.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {order.serviceFeeUSD ? `$${Number(order.serviceFeeUSD).toFixed(2)}` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
