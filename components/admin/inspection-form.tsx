"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { submitInspectionReport } from "@/actions/inspection";
import { submitInspectionSchema, type SubmitInspectionInput } from "@/lib/validations/inspection.schema";

interface Props {
  warehouseItemId: string;
  orderId: string;
}

const DEFAULT_CHECKS = [
  "Quantity matches order",
  "No visible damage",
  "Product matches description",
  "Packaging intact",
];

export function InspectionForm({ warehouseItemId, orderId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubmitInspectionInput>({
    resolver: zodResolver(submitInspectionSchema),
    defaultValues: {
      warehouseItemId,
      result: "PASSED",
      overallNotes: "",
      checkItems: DEFAULT_CHECKS.map((name) => ({
        checkName: name,
        passed: true,
        notes: "",
        photoUrls: [],
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "checkItems" });
  const checkItems = watch("checkItems");

  const onSubmit = (data: SubmitInspectionInput) => {
    startTransition(async () => {
      const result = await submitInspectionReport(data);
      if (!result.success) {
        toast({
          title: "Submission failed",
          description: result.error ?? "Something went wrong.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Inspection report submitted" });
      router.push(`/admin/orders/${orderId}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("warehouseItemId")} />

      {/* Overall result */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Overall Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Result</Label>
            <Select
              defaultValue="PASSED"
              onValueChange={(v) =>
                setValue("result", v as "PASSED" | "FAILED" | "PARTIAL")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASSED">Passed</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="overallNotes">Overall Notes</Label>
            <Textarea
              id="overallNotes"
              placeholder="General inspection notes…"
              rows={3}
              {...register("overallNotes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Check items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium">Check Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ checkName: "", passed: true, notes: "", photoUrls: [] })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Check
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.checkItems && typeof errors.checkItems.message === "string" && (
            <p className="text-xs text-destructive">{errors.checkItems.message}</p>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start p-3 border rounded-md">
              {/* Pass/Fail toggle */}
              <button
                type="button"
                onClick={() =>
                  setValue(`checkItems.${index}.passed`, !checkItems[index]?.passed)
                }
                className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  checkItems[index]?.passed
                    ? "border-green-500 bg-green-50 text-green-600 dark:bg-green-950"
                    : "border-red-500 bg-red-50 text-red-600 dark:bg-red-950"
                }`}
                aria-label={checkItems[index]?.passed ? "Mark as failed" : "Mark as passed"}
              >
                {checkItems[index]?.passed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>

              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Check name"
                  {...register(`checkItems.${index}.checkName`)}
                  aria-invalid={!!errors.checkItems?.[index]?.checkName}
                />
                {errors.checkItems?.[index]?.checkName && (
                  <p className="text-xs text-destructive">
                    {errors.checkItems[index]?.checkName?.message}
                  </p>
                )}
                <Input
                  placeholder="Notes (optional)"
                  {...register(`checkItems.${index}.notes`)}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Remove check"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit Report
        </Button>
      </div>
    </form>
  );
}
