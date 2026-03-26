import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ChevronRight } from "lucide-react";
import type { ServiceType } from "@prisma/client";

const SERVICE_LABELS: Record<ServiceType, string> = {
  PROCUREMENT: "Procurement Service",
  QUALITY_INSPECTION: "Quality Inspection",
  WAREHOUSING: "Warehousing",
  CONSOLIDATION: "Consolidation",
  LABELING: "Custom Labeling",
  REPACKAGING: "Repackaging",
};

const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  PROCUREMENT: "Agent fee for sourcing and purchasing items on your behalf",
  QUALITY_INSPECTION: "Physical inspection with photo report for each item",
  WAREHOUSING: "Storage at our China warehouse after the free grace period",
  CONSOLIDATION: "Bundling multiple items into a single outbound shipment",
  LABELING: "Custom label printing and application",
  REPACKAGING: "Repackage items into neutral or branded boxes",
};

export default async function PricingPage() {
  const configs = await prisma.serviceFeeConfig.findMany({
    where: { active: true },
    orderBy: { serviceType: "asc" },
  });

  const includedItems = [
    "No minimum order quantity",
    "30 days free warehousing per item",
    "Photo updates at every stage",
    "Dedicated sourcing agent",
    "International shipping at cost (zero markup)",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 border-b py-16 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <h1 className="font-display text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground text-xl">
            All fees are published. No hidden costs, no surprises.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {configs.length > 0 ? (
              configs.map((config) => (
                <Card key={config.id}>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit text-xs mb-2">
                      {config.serviceType.replace(/_/g, " ")}
                    </Badge>
                    <CardTitle className="text-lg">
                      {SERVICE_LABELS[config.serviceType]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold text-primary mb-2">
                      ${Number(config.baseFeeUSD).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {SERVICE_DESCRIPTIONS[config.serviceType]}
                    </p>
                    {config.description && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        {config.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback when no config in DB
              [
                { type: "PROCUREMENT", fee: "5%", label: "of order value (CNY)" },
                { type: "QUALITY_INSPECTION", fee: "$3.00", label: "per item" },
                { type: "WAREHOUSING", fee: "$0.05", label: "per item/day after 30 days" },
                { type: "CONSOLIDATION", fee: "$5.00", label: "per package" },
                { type: "LABELING", fee: "$2.00", label: "per item" },
                { type: "REPACKAGING", fee: "$4.00", label: "per item" },
              ].map((item) => (
                <Card key={item.type}>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit text-xs mb-2">
                      {item.type.replace(/_/g, " ")}
                    </Badge>
                    <CardTitle className="text-lg">
                      {SERVICE_LABELS[item.type as ServiceType]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-display font-bold text-primary mb-1">
                      {item.fee}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      {SERVICE_DESCRIPTIONS[item.type as ServiceType]}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* What's always included */}
          <div className="mt-12 p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="font-display text-2xl font-bold mb-6">Always Included</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {includedItems.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Sourcing Today <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="py-4 px-4 border-t text-center text-xs text-muted-foreground">
        International shipping is passed through at cost. BaoZhen earns zero margin on
        the shipping leg and bears no liability for third-party carrier services.
      </div>
    </div>
  );
}
