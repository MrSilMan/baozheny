import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TopUpForm } from "@/components/buyer/top-up-form";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TopUpPage() {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/buyer/wallet">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-display font-bold">Top Up Wallet</h1>
          <p className="text-sm text-muted-foreground">Add funds to your BaoZhen account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose Amount</CardTitle>
          <CardDescription>
            Funds will be credited instantly after payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopUpForm />
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <ShieldCheck className="h-4 w-4" />
        Payments are secured by Stripe. BaoZhen does not store card details.
      </div>
    </div>
  );
}
