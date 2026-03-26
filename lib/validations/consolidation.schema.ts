import { z } from "zod";

export const createConsolidationSchema = z.object({
  warehouseItemIds: z.array(z.string().cuid()).min(1, "Select at least one item"),
  addressId: z.string().cuid("Please select a delivery address"),
  serviceAddons: z.array(
    z.enum(["PROCUREMENT", "QUALITY_INSPECTION", "WAREHOUSING", "CONSOLIDATION", "LABELING", "REPACKAGING"])
  ).default([]),
  packagingNotes: z.string().max(1000).optional(),
});

export type CreateConsolidationInput = z.infer<typeof createConsolidationSchema>;
