import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {
  Package,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { ShipmentStatus } from "@prisma/client";
import Link from "next/link";

const statusConfig: Record<
  ShipmentStatus,
  { label: string; icon: React.ElementType; color: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  CREATED: { label: "Label Created", icon: Package, color: "text-muted-foreground", variant: "secondary" },
  PICKED_UP: { label: "Picked Up", icon: Package, color: "text-blue-600", variant: "outline" },
  IN_TRANSIT: { label: "In Transit", icon: Truck, color: "text-amber-600", variant: "outline" },
  CUSTOMS: { label: "Customs Clearance", icon: Clock, color: "text-amber-600", variant: "outline" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: Truck, color: "text-primary", variant: "default" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, color: "text-green-600", variant: "default" },
  EXCEPTION: { label: "Exception", icon: AlertCircle, color: "text-destructive", variant: "destructive" },
};

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: {
      carrier: true,
      events: { orderBy: { occurredAt: "desc" } },
      consolidation: {
        include: {
          buyer: { select: { name: true } },
        },
      },
    },
  });

  if (!shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Shipment Not Found</h1>
          <p className="text-muted-foreground mb-6">
            No shipment found for tracking number{" "}
            <code className="text-sm bg-muted px-2 py-0.5 rounded">{trackingNumber}</code>
          </p>
          <p className="text-sm text-muted-foreground">
            It may take up to 24 hours for tracking information to appear after dispatch.
          </p>
        </div>
      </div>
    );
  }

  const config = statusConfig[shipment.status];
  const StatusIcon = config.icon;
  const trackingUrl = shipment.carrier.trackingUrlTemplate.replace(
    "{number}",
    shipment.trackingNumber
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="font-display font-bold text-2xl text-primary">宝臻</span>
            <span className="font-display font-bold text-2xl">BaoZhen</span>
          </Link>
          <h1 className="font-display text-3xl font-bold">Track Your Shipment</h1>
        </div>

        {/* Status card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <p className="font-mono text-xl font-bold">{shipment.trackingNumber}</p>
              </div>
              <Badge variant={config.variant} className="text-sm py-1 px-3">
                <StatusIcon className="h-4 w-4 mr-1.5" />
                {config.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t text-sm">
              <div>
                <p className="text-muted-foreground">Carrier</p>
                <p className="font-medium">{shipment.carrier.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Delivery</p>
                <p className="font-medium">
                  {shipment.estimatedDelivery
                    ? format(shipment.estimatedDelivery, "MMM d, yyyy")
                    : "—"}
                </p>
              </div>
              {shipment.actualDelivery && (
                <div>
                  <p className="text-muted-foreground">Delivered</p>
                  <p className="font-medium text-green-600">
                    {format(shipment.actualDelivery, "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                  Track on {shipment.carrier.name}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events timeline */}
        {shipment.events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipment.events.map((event, i) => {
                  const ec = statusConfig[event.status];
                  const EventIcon = ec.icon;
                  return (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            i === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <EventIcon className="h-4 w-4" />
                        </div>
                        {i < shipment.events.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium text-sm ${ec.color}`}>{ec.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(event.occurredAt, "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          BaoZhen is the sourcing and consolidation agent for this shipment. International
          shipping and delivery is handled exclusively by {shipment.carrier.name}. BaoZhen
          bears no liability for the international shipping leg.
        </p>
      </div>
    </div>
  );
}
