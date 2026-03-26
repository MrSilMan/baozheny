import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  country: z.string().max(100).optional(),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

export const addressSchema = z.object({
  label: z.string().min(1).max(50).default("Home"),
  fullName: z.string().min(2, "Full name is required").max(100),
  company: z.string().max(200).optional().or(z.literal("")),
  line1: z.string().min(5, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().min(2, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(100),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().default(false),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["BUYER", "ADMIN", "SUPPLIER"]),
});

export const banUserSchema = z.object({
  userId: z.string().cuid(),
  reason: z.string().min(1, "Reason is required").max(500),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
