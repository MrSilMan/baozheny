"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTopUpSession } from "@/actions/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const PRESET_AMOUNTS = [50, 100, 250, 500];

export function TopUpForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(100);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = selected ?? (custom ? Number(custom) : 0);

  async function handleSubmit() {
    if (!amount || amount < 5) {
      setError("Minimum top-up is $5.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createTopUpSession(amount);
    if (result.success && result.data?.url) {
      router.push(result.data.url);
    } else {
      setError(result.error ?? "Failed to create payment session.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {PRESET_AMOUNTS.map((amt) => (
          <Button
            key={amt}
            type="button"
            variant={selected === amt && !custom ? "default" : "outline"}
            onClick={() => {
              setSelected(amt);
              setCustom("");
            }}
            className="h-14 text-lg font-display font-semibold"
          >
            ${amt}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom">Custom amount (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="custom"
            type="number"
            min={5}
            className="pl-7"
            placeholder="Enter amount"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setSelected(null);
            }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        className="w-full"
        size="lg"
        disabled={!amount || amount < 5 || loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to payment...
          </>
        ) : (
          `Pay $${amount > 0 ? amount.toFixed(2) : "0.00"}`
        )}
      </Button>
    </div>
  );
}
