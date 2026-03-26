import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
import Link from "next/link";

export default async function AdminWarehousePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
    redirect("/buyer/dashboard");
  }

  const items = await prisma.warehouseItem.findMany({
    include: {
      order: {
        select: {
          id: true,
          productName: true,
          buyer: { select: { name: true, email: true } },
        },
      },
      inspectionReport: { select: { result: true } },
    },
    orderBy: { receivedAt: "desc" },
  });

  const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    AWAITING: "secondary",
    STORED: "default",
    IN_CONSOLIDATION: "outline",
    SHIPPED: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Warehouse Inventory</h1>
        <p className="text-sm text-muted-foreground">
          {items.filter((i) => i.status === "STORED").length} stored ·{" "}
          {items.filter((i) => i.status === "AWAITING").length} awaiting
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inspection</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>SKU</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No items in warehouse.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${item.order.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.order.productName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.order.buyer.name ?? item.order.buyer.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.inspectionReport ? (
                        <Badge
                          variant={
                            item.inspectionReport.result === "PASSED"
                              ? "default"
                              : item.inspectionReport.result === "FAILED"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {item.inspectionReport.result}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.weight ? `${Number(item.weight).toFixed(0)}g` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(item.receivedAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.sku ?? "—"}
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
