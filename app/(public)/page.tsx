import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ShoppingBag,
  ClipboardCheck,
  Truck,
  Shield,
  Clock,
  Star,
  Globe,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    number: "01",
    icon: FileText,
    title: "Submit Your Request",
    description:
      "Tell us what you need. Paste a product URL from Taobao, 1688, or Pinduoduo, or describe what you're looking for.",
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "We Procure It",
    description:
      "Our sourcing agents negotiate with Chinese suppliers, confirm pricing, and purchase on your behalf.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Quality Inspection",
    description:
      "Every item is inspected at our China warehouse. You receive a photo report with pass/fail for each check.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Consolidated Shipment",
    description:
      "Bundle multiple items into one box, choose your 3PL carrier, and track via the carrier's system.",
  },
];

const WHY = [
  {
    icon: Shield,
    title: "Vetted Suppliers",
    description: "We maintain relationships with reliable Chinese suppliers across all major platforms.",
  },
  {
    icon: ClipboardCheck,
    title: "Photo Inspection",
    description: "Every item is physically checked and photographed before leaving our warehouse.",
  },
  {
    icon: Package,
    title: "Flexible Warehousing",
    description: "Store items at our China warehouse for up to 30 days free. Consolidate on your schedule.",
  },
  {
    icon: Globe,
    title: "Any Carrier",
    description: "We hand off to DHL, FedEx, EMS, SF Express, or your preferred 3PL at cost — zero markup.",
  },
  {
    icon: Star,
    title: "Transparent Pricing",
    description: "All fees are published. Service fee, inspection fee, storage — no surprises.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most procurement orders are placed within 24 hours of submission.",
  },
];

const STATS = [
  { value: "10,000+", label: "Orders Fulfilled" },
  { value: "50+", label: "Countries Shipped To" },
  { value: "< 48h", label: "Avg Procurement Time" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-linear-to-br from-vermillion-900 via-vermillion-800 to-vermillion-950 text-white py-24 px-4">
        <div className="container max-w-5xl mx-auto text-center">
          <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
            China Sourcing Agent Platform
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Precious goods.
            <br />
            <span className="text-gold-400">Perfected delivery.</span>
          </h1>
          <p className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto mb-10">
            Submit your product requirements — BaoZhen handles supplier negotiation,
            quality inspection, warehousing, and consolidated global shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/register">
                Start Your First Order <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-white/20">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-bold text-gold-400">{stat.value}</div>
                <div className="text-white/60 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              From request to your doorstep in 4 simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {STEPS.map((step) => (
              <div key={step.number} className="flex gap-5">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-primary font-bold mb-1">
                    STEP {step.number}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/how-it-works">
                Full Process Walkthrough <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why BaoZhen */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-bold mb-3">Why BaoZhen</h2>
            <p className="text-muted-foreground text-lg">
              The sourcing partner built for quality-first global buyers.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY.map((item) => (
              <Card key={item.title} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">
            Ready to source smarter?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Create your free account and submit your first sourcing request today.
            No minimum order quantity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="py-4 px-4 border-t text-center text-xs text-muted-foreground">
        BaoZhen is a sourcing and fulfillment agent. International shipping is handled exclusively
        by third-party carriers (DHL, FedEx, EMS, SF Express, etc.). BaoZhen bears no liability
        for the international shipping leg.
      </div>
    </div>
  );
}
