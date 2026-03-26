import { z } from "zod";

export const topUpSchema = z.object({
  amountUSD: z
    .number()
    .min(5, "Minimum top-up is $5")
    .max(10000, "Maximum top-up is $10,000"),
});

export type TopUpInput = z.infer<typeof topUpSchema>;
