import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Truck, ExternalLink, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { ShipmentStatus } from "@prisma/client";

const statusVariant: Record<ShipmentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  CREATED: "secondary",
  PICKED_UP: "outline",
  IN_TRANSIT: "outline",
  CUSTOMS: "outline",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "default",
  EXCEPTION: "destructive",
};

export default async function ShipmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const shipments = await prisma.shipment.findMany({
    where: {
      consolidation: { buyerId: session.user.id },
    },
    include: {
      carrier: true,
      events: { orderBy: { occurredAt: "desc" }, take: 1 },
      consolidation: {
        include: {
          items: {
            include: {
              warehouseItem: {
                include: {
                  order: { select: { productName: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold">Shipments</h1>

      {shipments.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">No shipments yet</h2>
          <p className="text-muted-foreground mb-6">
            Shipments appear here after you request consolidation and we hand off to a carrier.
          </p>
          <Button asChild variant="outline">
            <Link href="/buyer/warehouse">Go to Warehouse</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => {
            const trackingUrl = shipment.carrier.trackingUrlTemplate.replace(
              "{number}",
              shipment.trackingNumber
            );
            const latestEvent = shipment.events[0];
            const itemNames = shipment.consolidation.items
              .map((i) => i.warehouseItem.order.productName)
              .slice(0, 2);
            const remainingCount = shipment.consolidation.items.length - 2;

            return (
              <Card key={shipment.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={statusVariant[shipment.status]}>
                          {shipment.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          via {shipment.carrier.name}
                        </span>
                      </div>
                      <p className="font-mono text-sm font-medium">{shipment.trackingNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {itemNames.join(", ")}
                        {remainingCount > 0 && ` + ${remainingCount} more`}
                      </p>
                      {latestEvent && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {latestEvent.location} · {format(latestEvent.occurredAt, "MMM d")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tracking/${shipment.trackingNumber}`}>
                          <Package className="h-4 w-4 mr-1.5" />
                          Track
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  {shipment.estimatedDelivery && shipment.status !== "DELIVERED" && (
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      Est. delivery: {format(shipment.estimatedDelivery, "MMMM d, yyyy")}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        International shipping is handled by third-party carriers. BaoZhen bears no liability
        for the international shipping leg.
      </p>
    </div>
  );
}
