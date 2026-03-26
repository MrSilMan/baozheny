import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Boxes, Plus, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { ConsolidationStatus } from "@prisma/client";

const statusVariant: Record<ConsolidationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  REQUESTED: "outline",
  CONFIRMED: "outline",
  PACKED: "outline",
  HANDED_OFF: "default",
};

export default async function ConsolidationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const consolidations = await prisma.consolidationRequest.findMany({
    where: { buyerId: session.user.id },
    include: {
      address: true,
      items: {
        include: {
          warehouseItem: {
            include: {
              order: { select: { productName: true } },
            },
          },
        },
      },
      shipment: { include: { carrier: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Consolidation</h1>
        <Button asChild>
          <Link href="/buyer/consolidation/new">
            <Plus className="h-4 w-4 mr-2" /> New Request
          </Link>
        </Button>
      </div>

      {consolidations.length === 0 ? (
        <div className="text-center py-16">
          <Boxes className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No consolidation requests yet</h2>
          <p className="text-muted-foreground mb-6">
            Select items from your warehouse shelf and bundle them into one shipment to save on shipping costs.
          </p>
          <Button asChild variant="outline">
            <Link href="/buyer/warehouse">View Warehouse</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {consolidations.map((c) => {
            const itemNames = c.items.map((i) => i.warehouseItem.order.productName).slice(0, 2);
            const extra = c.items.length - 2;
            return (
              <Card key={c.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {c.items.length} item{c.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {itemNames.join(", ")}
                        {extra > 0 && ` + ${extra} more`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        To: {c.address.city}, {c.address.country}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested {format(c.requestedAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    {c.shipment && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tracking/${c.shipment.trackingNumber}`}>
                          <Truck className="h-4 w-4 mr-1.5" />
                          Track
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
