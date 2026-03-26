import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default async function AdminInspectionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") redirect("/buyer/dashboard");

  const pendingItems = await prisma.warehouseItem.findMany({
    where: {
      order: { status: "INSPECTION_PENDING" },
      inspectionReport: null,
    },
    include: {
      order: { select: { id: true, productName: true, buyer: { select: { name: true } } } },
    },
    orderBy: { receivedAt: "asc" },
  });

  const completedReports = await prisma.inspectionReport.findMany({
    include: {
      warehouseItem: {
        include: {
          order: { select: { id: true, productName: true, buyer: { select: { name: true } } } },
        },
      },
      inspector: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-bold">Inspection</h1>

      {/* Pending queue */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Pending Queue{" "}
          {pendingItems.length > 0 && (
            <Badge variant="destructive">{pendingItems.length}</Badge>
          )}
        </h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No items pending inspection.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.order.productName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.order.buyer.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(item.receivedAt, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" asChild>
                          <Link href={`/admin/inspection/${item.order.id}`}>
                            Inspect
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent reports */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Reports</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${report.warehouseItem.order.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {report.warehouseItem.order.productName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.warehouseItem.order.buyer.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.result === "PASSED" ? "default"
                          : report.result === "FAILED" ? "destructive"
                          : "outline"
                        }
                      >
                        {report.result}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {report.inspector.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(report.createdAt, "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
