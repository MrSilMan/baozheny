import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ConsolidationStatusActions } from "@/components/admin/consolidation-status-actions";
import type { ConsolidationStatus } from "@prisma/client";

const statusVariant: Record<ConsolidationStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  REQUESTED: "destructive",
  CONFIRMED: "outline",
  PACKED: "outline",
  HANDED_OFF: "default",
};

export default async function AdminConsolidationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN" && session.user.role !== "AGENT") {
    redirect("/buyer/dashboard");
  }

  const { id } = await params;

  const consolidation = await prisma.consolidationRequest.findUnique({
    where: { id },
    include: {
      buyer: { select: { name: true, email: true } },
      address: true,
      items: {
        include: {
          warehouseItem: {
            include: {
              order: { select: { id: true, productName: true, quantity: true } },
            },
          },
        },
      },
      shipment: {
        include: {
          carrier: { select: { name: true, trackingUrlTemplate: true } },
          events: { orderBy: { occurredAt: "desc" }, take: 5 },
        },
      },
    },
  });

  if (!consolidation) notFound();

  const trackingUrl = consolidation.shipment
    ? consolidation.shipment.carrier.trackingUrlTemplate.replace(
        "{number}",
        consolidation.shipment.trackingNumber
      )
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/consolidation">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold">
            {consolidation.buyer.name ?? consolidation.buyer.email}
          </h1>
          <p className="text-sm text-muted-foreground">
            {consolidation.items.length} item{consolidation.items.length !== 1 ? "s" : ""} ·
            Requested {format(consolidation.requestedAt, "MMM d, yyyy")}
          </p>
        </div>
        <Badge variant={statusVariant[consolidation.status]}>{consolidation.status}</Badge>
      </div>

      {/* Admin status actions */}
      <ConsolidationStatusActions
        consolidationId={consolidation.id}
        status={consolidation.status}
        estimatedWeightKg={
          consolidation.estimatedWeightKg != null
            ? Number(consolidation.estimatedWeightKg)
            : null
        }
      />

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({consolidation.items.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {consolidation.items.map(({ warehouseItem }) => (
            <div key={warehouseItem.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {warehouseItem.order.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty {warehouseItem.order.quantity}
                  {warehouseItem.sku ? ` · SKU: ${warehouseItem.sku}` : ""}
                  {warehouseItem.weight
                    ? ` · ${Number(warehouseItem.weight).toFixed(0)}g`
                    : ""}
                </p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/orders/${warehouseItem.order.id}`}>
                  View Order
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Destination address */}
      <Card>
        <CardHeader>
          <CardTitle>Destination Address</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p className="font-medium">{consolidation.address.fullName}</p>
          <p>{consolidation.address.line1}</p>
          {consolidation.address.line2 && <p>{consolidation.address.line2}</p>}
          <p>
            {consolidation.address.city}
            {consolidation.address.state ? `, ${consolidation.address.state}` : ""}{" "}
            {consolidation.address.postalCode}
          </p>
          <p>{consolidation.address.country}</p>
          {consolidation.address.phone && (
            <p className="text-muted-foreground">{consolidation.address.phone}</p>
          )}
        </CardContent>
      </Card>

      {/* Service add-ons & notes */}
      {(consolidation.serviceAddons.length > 0 ||
        consolidation.packagingNotes ||
        consolidation.agentNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes & Add-ons</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {consolidation.serviceAddons.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1">Service Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {consolidation.serviceAddons.map((addon) => (
                    <Badge key={addon} variant="outline">
                      {addon.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {consolidation.packagingNotes && (
              <div>
                <p className="text-muted-foreground">Buyer Packaging Notes</p>
                <p className="whitespace-pre-wrap">{consolidation.packagingNotes}</p>
              </div>
            )}
            {consolidation.agentNotes && (
              <div>
                <p className="text-muted-foreground">Agent Notes</p>
                <p className="whitespace-pre-wrap text-amber-700 dark:text-amber-400">
                  {consolidation.agentNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shipment */}
      {consolidation.shipment && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Shipment</CardTitle>
            {trackingUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={trackingUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Track on {consolidation.shipment.carrier.name}
                </a>
              </Button>
            )}
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Carrier</p>
                <p className="font-medium">{consolidation.shipment.carrier.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tracking Number</p>
                <p className="font-mono font-medium">{consolidation.shipment.trackingNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant="outline">{consolidation.shipment.status}</Badge>
              </div>
              {consolidation.shipment.estimatedDelivery && (
                <div>
                  <p className="text-muted-foreground">Est. Delivery</p>
                  <p className="font-medium">
                    {format(consolidation.shipment.estimatedDelivery, "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>

            {consolidation.shipment.events.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-2">Recent Events</p>
                  <div className="space-y-2">
                    {consolidation.shipment.events.map((event) => (
                      <div key={event.id} className="flex gap-3 text-xs">
                        <span className="text-muted-foreground shrink-0">
                          {format(event.occurredAt, "MMM d, HH:mm")}
                        </span>
                        <span>
                          {event.description ?? event.status}
                          {event.location ? ` — ${event.location}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>Requested: {format(consolidation.requestedAt, "MMM d, yyyy 'at' h:mm a")}</p>
          {consolidation.confirmedAt && (
            <p>Confirmed: {format(consolidation.confirmedAt, "MMM d, yyyy 'at' h:mm a")}</p>
          )}
          {consolidation.handedOffAt && (
            <p>Handed Off: {format(consolidation.handedOffAt, "MMM d, yyyy 'at' h:mm a")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
