import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

const ORDER_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: "SUBMITTED", label: "Order Submitted", description: "Your sourcing request has been received" },
  { status: "PROCURING", label: "Procuring", description: "Our agent is sourcing your items" },
  { status: "ARRIVED_CN", label: "Arrived in China", description: "Items have arrived at our warehouse" },
  { status: "INSPECTION_PENDING", label: "Inspection Pending", description: "Quality inspection is scheduled" },
  { status: "INSPECTION_DONE", label: "Inspection Done", description: "Quality check completed" },
  { status: "STORED", label: "Stored", description: "Items are stored and ready for consolidation" },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  DRAFT: -1,
  SUBMITTED: 0,
  PROCURING: 1,
  ARRIVED_CN: 2,
  INSPECTION_PENDING: 3,
  INSPECTION_DONE: 4,
  STORED: 5,
  CANCELLED: -2,
};

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function OrderTimeline({ status, createdAt, updatedAt }: OrderTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
        <XCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Order Cancelled</p>
          <p className="text-sm">{formatDate(updatedAt)}</p>
        </div>
      </div>
    );
  }

  if (status === "DRAFT") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted text-muted-foreground">
        <Clock className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Draft</p>
          <p className="text-sm">Created {formatDate(createdAt)}</p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[status];

  return (
    <ol className="relative" aria-label="Order timeline">
      {ORDER_STEPS.map((step, index) => {
        const stepOrder = STATUS_ORDER[step.status];
        const isCompleted = stepOrder < currentStep;
        const isCurrent = stepOrder === currentStep;
        const isFuture = stepOrder > currentStep;

        return (
          <li key={step.status} className={cn("flex gap-4", index < ORDER_STEPS.length - 1 && "pb-6")}>
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                  isCurrent && "border-primary bg-primary text-primary-foreground",
                  isFuture && "border-muted-foreground/30 bg-background text-muted-foreground"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              {index < ORDER_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mt-1 h-full w-0.5 flex-1",
                    isCompleted ? "bg-emerald-500" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-1">
              <p
                className={cn(
                  "font-medium text-sm",
                  isFuture && "text-muted-foreground",
                  isCurrent && "text-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              {isCurrent && (
                <p className="text-xs text-muted-foreground mt-1">{formatDate(updatedAt)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
