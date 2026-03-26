"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/procurement";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus | null> = {
  DRAFT: "SUBMITTED",
  SUBMITTED: "PROCURING",
  PROCURING: "ARRIVED_CN",
  ARRIVED_CN: "INSPECTION_PENDING",
  INSPECTION_PENDING: "INSPECTION_DONE",
  INSPECTION_DONE: "STORED",
  STORED: null,
  CANCELLED: null,
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  PROCURING: "Procuring",
  ARRIVED_CN: "Arrived in China",
  INSPECTION_PENDING: "Pending Inspection",
  INSPECTION_DONE: "Inspection Done",
  STORED: "Stored",
  CANCELLED: "Cancelled",
};

interface Props {
  order: { id: string; status: OrderStatus };
  agents: { id: string; name: string | null }[];
  currentAgentId?: string;
}

export function OrderStatusActions({ order, agents, currentAgentId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState(currentAgentId ?? "");

  const nextStatus = STATUS_TRANSITIONS[order.status];

  async function advanceStatus() {
    if (!nextStatus) return;
    setLoading(true);
    setError(null);
    const result = await updateOrderStatus({
      orderId: order.id,
      status: nextStatus,
      agentId: agentId || undefined,
    });
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "Failed to update status.");
    }
  }

  async function cancelOrder() {
    setLoading(true);
    setError(null);
    const result = await updateOrderStatus({ orderId: order.id, status: "CANCELLED" });
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "Failed to cancel.");
    }
  }

  if (order.status === "CANCELLED" || order.status === "STORED") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Assign agent */}
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Assign agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name ?? agent.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advance status */}
          {nextStatus && (
            <Button onClick={advanceStatus} disabled={loading} className="flex-1 sm:flex-none">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Mark as: {STATUS_LABELS[nextStatus]}
            </Button>
          )}

          {/* Cancel */}
          <Button
            variant="outline"
            onClick={cancelOrder}
            disabled={loading}
            className="text-destructive hover:text-destructive"
          >
            Cancel Order
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
