import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { ConsolidationStatus } from "@prisma/client";

const statusVariant: Record<ConsolidationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  REQUESTED: "destructive",
  CONFIRMED: "outline",
  PACKED: "outline",
  HANDED_OFF: "default",
};

export default async function AdminConsolidationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") redirect("/buyer/dashboard");

  const consolidations = await prisma.consolidationRequest.findMany({
    include: {
      buyer: { select: { name: true, email: true } },
      address: { select: { city: true, country: true } },
      items: { select: { id: true } },
      shipment: { select: { trackingNumber: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Consolidation</h1>
        <p className="text-sm text-muted-foreground">
          {consolidations.filter(c => c.status === "REQUESTED").length} awaiting confirmation
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consolidations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No consolidation requests.
                  </TableCell>
                </TableRow>
              ) : (
                consolidations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link
                        href={`/admin/consolidation/${c.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {c.buyer.name ?? c.buyer.email}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{c.items.length}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.address.city}, {c.address.country}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.shipment?.trackingNumber ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(c.requestedAt, "MMM d, yyyy")}
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
