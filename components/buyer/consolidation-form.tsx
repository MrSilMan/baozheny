"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestConsolidation } from "@/actions/consolidation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface Props {
  items: { id: string; name: string; weight: number | null }[];
  addresses: { id: string; label: string; isDefault: boolean }[];
}

export function ConsolidationForm({ items, addresses }: Props) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addressId, setAddressId] = useState(
    addresses.find((a) => a.isDefault)?.id ?? ""
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleItem(id: string) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (selectedItems.length === 0) {
      setError("Select at least one item.");
      return;
    }
    if (!addressId) {
      setError("Please select a delivery address.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await requestConsolidation({
      warehouseItemIds: selectedItems,
      addressId,
      serviceAddons: [],
      packagingNotes: notes || undefined,
    });
    setLoading(false);
    if (result.success) {
      router.push("/buyer/consolidation");
    } else {
      setError(result.error ?? "Failed to submit consolidation request.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Item selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Select Items</Label>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleItem(item.id)}
            >
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.weight && (
                  <p className="text-xs text-muted-foreground">{item.weight.toFixed(0)}g</p>
                )}
              </div>
            </div>
          ))}
        </div>
        {selectedItems.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Destination address */}
      <div className="space-y-2">
        <Label>Destination Address</Label>
        <Select value={addressId} onValueChange={setAddressId}>
          <SelectTrigger>
            <SelectValue placeholder="Select delivery address" />
          </SelectTrigger>
          <SelectContent>
            {addresses.length === 0 ? (
              <SelectItem value="" disabled>
                No addresses saved
              </SelectItem>
            ) : (
              addresses.map((addr) => (
                <SelectItem key={addr.id} value={addr.id}>
                  {addr.label}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Packaging Notes (optional)</Label>
        <Textarea
          placeholder="Any special packaging requirements..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={loading || selectedItems.length === 0}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Request Consolidation"
        )}
      </Button>
    </div>
  );
}
