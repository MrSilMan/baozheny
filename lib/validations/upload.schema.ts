import { z } from "zod";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadImageSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().refine((t) => ALLOWED_IMAGE_TYPES.includes(t), {
    message: "Only JPEG, PNG, WebP, and AVIF images are allowed",
  }),
  size: z.number().max(MAX_IMAGE_SIZE, "Image must be less than 5MB"),
  folder: z.enum(["products", "suppliers", "avatars", "categories"]),
});

export const uploadDocumentSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().refine((t) => ALLOWED_DOCUMENT_TYPES.includes(t), {
    message: "Only PDF documents are allowed",
  }),
  size: z.number().max(MAX_DOCUMENT_SIZE, "Document must be less than 10MB"),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
