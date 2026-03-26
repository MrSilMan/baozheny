import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SubmitOrderForm } from "@/components/buyer/submit-order-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewOrderPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/buyer/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Submit Sourcing Request</h1>
          <p className="text-muted-foreground text-sm">
            Tell us what you need and we&apos;ll procure it from China.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Provide as much detail as possible. Include a product URL if you have one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitOrderForm />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-400">Service Fee Notice</p>
        <p className="text-amber-700 dark:text-amber-500 mt-1">
          A procurement service fee will be deducted from your wallet upon order confirmation.
          If your balance is insufficient, you&apos;ll be prompted to top up.
        </p>
      </div>
    </div>
  );
}
