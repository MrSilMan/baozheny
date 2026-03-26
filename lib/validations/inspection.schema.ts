import { z } from "zod";

export const submitInspectionSchema = z.object({
  warehouseItemId: z.string().cuid(),
  result: z.enum(["PASSED", "FAILED", "PARTIAL"]),
  overallNotes: z.string().max(2000).optional(),
  checkItems: z.array(
    z.object({
      checkName: z.string().min(1).max(100),
      passed: z.boolean(),
      notes: z.string().max(500).optional(),
      photoUrls: z.array(z.string().url()).max(5).default([]),
    })
  ).min(1, "At least one check item is required"),
});

export type SubmitInspectionInput = z.infer<typeof submitInspectionSchema>;
