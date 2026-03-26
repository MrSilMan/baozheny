import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
    redirect("/buyer/dashboard");
  }

  const { status, search } = await searchParams;

  const orders = await prisma.procurementOrder.findMany({
    where: {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(search
        ? {
            OR: [
              { productName: { contains: search, mode: "insensitive" } },
              { orderNumber: { contains: search, mode: "insensitive" } },
              { buyer: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      buyer: { select: { name: true, email: true } },
      agent: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">All Orders</h1>
        <div className="text-sm text-muted-foreground">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All", value: "" },
          { label: "Submitted", value: "SUBMITTED" },
          { label: "Procuring", value: "PROCURING" },
          { label: "Arrived", value: "ARRIVED_CN" },
          { label: "Inspection", value: "INSPECTION_PENDING" },
          { label: "Stored", value: "STORED" },
          { label: "Cancelled", value: "CANCELLED" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/orders?status=${tab.value}` : "/admin/orders"}
          >
            <Badge
              variant={
                status === tab.value || (!status && !tab.value) ? "default" : "outline"
              }
              className="cursor-pointer"
            >
              {tab.label}
            </Badge>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {order.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        #{order.orderNumber.slice(-8)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{order.buyer.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{order.buyer.email}</p>
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
                      {order.agent?.name ?? "Unassigned"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(order.createdAt, "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
