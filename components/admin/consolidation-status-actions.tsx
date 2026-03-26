"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { updateConsolidationStatus } from "@/actions/consolidation";
import type { ConsolidationStatus } from "@prisma/client";

const STATUS_TRANSITIONS: Partial<Record<ConsolidationStatus, "CONFIRMED" | "PACKED" | "HANDED_OFF">> = {
  REQUESTED: "CONFIRMED",
  CONFIRMED: "PACKED",
  PACKED: "HANDED_OFF",
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirm",
  PACKED: "Mark as Packed",
  HANDED_OFF: "Mark as Handed Off",
};

interface Props {
  consolidationId: string;
  status: ConsolidationStatus;
  estimatedWeightKg: number | null;
}

export function ConsolidationStatusActions({ consolidationId, status, estimatedWeightKg }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [agentNotes, setAgentNotes] = useState("");
  const [weightKg, setWeightKg] = useState(
    estimatedWeightKg != null ? String(estimatedWeightKg) : ""
  );

  const nextStatus = STATUS_TRANSITIONS[status];
  if (!nextStatus) return null;

  function advance() {
    startTransition(async () => {
      const result = await updateConsolidationStatus({
        consolidationId,
        status: nextStatus!,
        agentNotes: agentNotes.trim() || undefined,
        estimatedWeightKg: weightKg ? parseFloat(weightKg) : undefined,
      });

      if (!result.success) {
        toast({
          title: "Update failed",
          description: result.error ?? "Something went wrong.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Status updated" });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weightKg">Estimated Weight (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 2.50"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agentNotes">Agent Notes</Label>
          <Textarea
            id="agentNotes"
            placeholder="Internal notes for this consolidation…"
            rows={2}
            value={agentNotes}
            onChange={(e) => setAgentNotes(e.target.value)}
          />
        </div>

        <Button onClick={advance} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {STATUS_LABELS[nextStatus]}
        </Button>
      </CardContent>
    </Card>
  );
}
