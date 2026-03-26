import {
  FileText,
  ShoppingBag,
  ClipboardCheck,
  Truck,
  Warehouse,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-muted/30 border-b py-16 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <h1 className="font-display text-5xl font-bold mb-4">How BaoZhen Works</h1>
          <p className="text-muted-foreground text-xl">
            From your product idea to your doorstep — every step explained.
          </p>
        </div>
      </section>

      {/* Detailed steps */}
      <section className="py-16 px-4">
        <div className="container max-w-3xl mx-auto space-y-16">
          {[
            {
              step: "01",
              icon: FileText,
              title: "Submit a Sourcing Request",
              description:
                "Log in to your BaoZhen account and click 'New Order'. Tell us what you need — paste a product URL from Taobao, 1688, or Pinduoduo, or describe the product in detail. Include quantity, specifications, and any special requirements.",
              detail:
                "You can submit requests for any product available on major Chinese platforms. Our team will confirm availability and pricing within 24 hours.",
            },
            {
              step: "02",
              icon: ShoppingBag,
              title: "BaoZhen Procures Your Items",
              description:
                "Once you confirm the order, our sourcing agents negotiate with suppliers, place the purchase, and coordinate delivery to our China warehouse. You'll be notified at each stage.",
              detail:
                "A procurement service fee is deducted from your wallet upon order confirmation. You can top up your wallet via Stripe at any time.",
            },
            {
              step: "03",
              icon: Warehouse,
              title: "Items Arrive at Our Warehouse",
              description:
                "Your items are received at our China warehouse. Each item is logged with photos, weight, and dimensions. You can see your virtual shelf in the Warehouse section of your dashboard.",
              detail:
                "Items are stored free of charge for 30 days. After that, a small daily storage fee applies. You're notified before any fees begin.",
            },
            {
              step: "04",
              icon: ClipboardCheck,
              title: "Quality Inspection",
              description:
                "Every item undergoes a thorough quality inspection. Our team checks against your specifications, photographs each item, and produces a detailed pass/fail report.",
              detail:
                "If items fail inspection, you'll be notified immediately with options: refund, re-procurement, or ship as-is with your acknowledgment.",
            },
            {
              step: "05",
              icon: Truck,
              title: "Consolidation & Handoff to 3PL",
              description:
                "Select items from your warehouse shelf and request consolidation. BaoZhen packages your items, weighs the bundle, and hands off to your preferred international carrier (DHL, FedEx, EMS, SF Express, etc.).",
              detail:
                "International shipping is charged at cost — BaoZhen earns zero margin on the shipping leg. You receive a tracking number and can track via the carrier's website.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-6">
              <div className="shrink-0 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="w-px flex-1 bg-border mt-4" />
              </div>
              <div className="pb-8">
                <div className="text-xs font-mono text-primary font-bold mb-1">
                  STEP {item.step}
                </div>
                <h2 className="font-display text-2xl font-bold mb-3">{item.title}</h2>
                <p className="text-foreground mb-3">{item.description}</p>
                <p className="text-muted-foreground text-sm">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5 border-t">
        <div className="container max-w-xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-3">Ready to start?</h2>
          <p className="text-muted-foreground mb-6">
            Create your free account and submit your first sourcing request.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Get Started <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="py-4 px-4 border-t text-center text-xs text-muted-foreground">
        BaoZhen bears no liability for the international shipping leg. All international
        shipping is handled by independent third-party carriers.
      </div>
    </div>
  );
}
