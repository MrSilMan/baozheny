"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitOrder } from "@/actions/procurement";
import { submitOrderSchema, type SubmitOrderInput } from "@/lib/validations/order.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const PLATFORMS = [
  { value: "TAOBAO", label: "Taobao (淘宝)" },
  { value: "PINDUODUO", label: "Pinduoduo (拼多多)" },
  { value: "ALI1688", label: "1688 (阿里1688)" },
  { value: "WECHAT", label: "WeChat (微信)" },
  { value: "OTHER", label: "Other" },
];

export function SubmitOrderForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SubmitOrderInput>({
    resolver: zodResolver(submitOrderSchema),
    defaultValues: {
      productName: "",
      productUrl: "",
      platform: undefined,
      productDescription: "",
      quantity: 1,
      specNotes: "",
    },
  });

  async function onSubmit(data: SubmitOrderInput) {
    setError(null);
    const result = await submitOrder(data);
    if (result.success && result.data) {
      router.push(`/buyer/orders/${result.data.id}`);
    } else {
      setError(result.error ?? "Failed to submit order. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Ceramic coffee mug set (12 pcs)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="platform"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="productUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://item.taobao.com/..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Paste the product link from Taobao, 1688, Pinduoduo, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the product in detail: color, material, size, packaging requirements..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any specific requirements, inspection criteria, or notes for our team..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Sourcing Request"
          )}
        </Button>
      </form>
    </Form>
  );
}
