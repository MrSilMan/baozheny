import { z } from "zod";

export const submitOrderSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters").max(200),
  productUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  platform: z.enum(["TAOBAO", "PINDUODUO", "ALI1688", "WECHAT", "OTHER"]).optional(),
  productDescription: z.string().max(2000).optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(100000),
  specNotes: z.string().max(1000).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional().default([]),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum([
    "DRAFT",
    "SUBMITTED",
    "PROCURING",
    "ARRIVED_CN",
    "INSPECTION_PENDING",
    "INSPECTION_DONE",
    "STORED",
    "CANCELLED",
  ]),
  agentId: z.string().cuid().optional(),
  agentNotes: z.string().max(2000).optional(),
  unitPriceCNY: z.number().positive().optional(),
  serviceFeeUSD: z.number().positive().optional(),
});

export type SubmitOrderInput = z.infer<typeof submitOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
