import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Warehouse, Boxes, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, differenceInDays } from "date-fns";

export default async function WarehousePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const items = await prisma.warehouseItem.findMany({
    where: { buyerId: session.user.id, status: { not: "SHIPPED" } },
    include: {
      order: { select: { productName: true, id: true } },
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

  const inspectionVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    PASSED: "default",
    FAILED: "destructive",
    PARTIAL: "outline",
    PENDING: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Warehouse</h1>
        {items.some((i) => i.status === "STORED") && (
          <Button asChild>
            <Link href="/buyer/consolidation/new">
              <Boxes className="h-4 w-4 mr-2" /> Request Consolidation
            </Link>
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Warehouse className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Your warehouse shelf is empty</h2>
          <p className="text-muted-foreground mb-6">
            Items will appear here once they arrive at our China warehouse.
          </p>
          <Button asChild variant="outline">
            <Link href="/buyer/orders/new">Submit a sourcing order</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const daysStored = item.storageStartDate
              ? differenceInDays(new Date(), item.storageStartDate)
              : 0;
            const storageFee =
              daysStored > 0
                ? (daysStored * Number(item.storageFeePerDay)).toFixed(2)
                : "0.00";

            return (
              <Card key={item.id} className="overflow-hidden">
                {item.photoUrls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.photoUrls[0]}
                    alt={item.order.productName}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-muted flex items-center justify-center">
                    <Warehouse className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="font-medium text-sm line-clamp-2">{item.order.productName}</p>
                    {item.sku && (
                      <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                    {item.inspectionReport && (
                      <Badge variant={inspectionVariant[item.inspectionReport.result]}>
                        {item.inspectionReport.result}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Scale className="h-3 w-3" />
                      {item.weight ? `${Number(item.weight).toFixed(0)}g` : "—"}
                    </div>
                    <div>Arrived {format(item.receivedAt, "MMM d")}</div>
                  </div>
                  {Number(storageFee) > 0 && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Storage fee: ${storageFee} ({daysStored} days)
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/buyer/orders/${item.order.id}`}>View Order</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* BaoZhen is not the carrier disclaimer */}
      <p className="text-xs text-muted-foreground text-center max-w-lg mx-auto">
        Items are stored at BaoZhen&apos;s China warehouse. International shipping is handled
        exclusively by third-party carriers (DHL, FedEx, EMS, SF Express, etc.).
        BaoZhen bears no liability for the international shipping leg.
      </p>
    </div>
  );
}
