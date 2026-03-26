import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConsolidationForm } from "@/components/buyer/consolidation-form";

export default async function NewConsolidationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [storedItems, addresses] = await Promise.all([
    prisma.warehouseItem.findMany({
      where: { buyerId: session.user.id, status: "STORED" },
      include: { order: { select: { productName: true } } },
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
    }),
  ]);

  if (storedItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-muted-foreground mb-4">
          You have no stored items available for consolidation.
        </p>
        <Button asChild variant="outline">
          <Link href="/buyer/warehouse">View Warehouse</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/buyer/consolidation">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-display font-bold">Request Consolidation</h1>
          <p className="text-muted-foreground text-sm">
            Bundle your stored items into one outbound shipment.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Items & Destination</CardTitle>
          <CardDescription>
            Choose which items to consolidate and where to ship them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConsolidationForm items={storedItems.map(i => ({ id: i.id, name: i.order.productName, weight: i.weight ? Number(i.weight) : null }))} addresses={addresses.map(a => ({ id: a.id, label: `${a.fullName} — ${a.city}, ${a.country}`, isDefault: a.isDefault }))} />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-muted p-4 text-xs text-muted-foreground">
        International shipping is handled by third-party carriers (DHL, FedEx, EMS, SF Express, etc.).
        BaoZhen bears no liability for the international shipping leg.
      </div>
    </div>
  );
}
