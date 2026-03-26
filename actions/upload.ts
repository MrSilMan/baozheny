"use server";

import { auth } from "@/auth";
import { getPresignedUploadUrl } from "@/lib/s3";
import { uploadImageSchema } from "@/lib/validations/upload.schema";
import type { UploadImageInput } from "@/lib/validations/upload.schema";
import type { ActionResponse } from "@/types/actions";

export async function getUploadUrl(
  data: UploadImageInput
): Promise<ActionResponse<{ uploadUrl: string; publicUrl: string; key: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const validated = uploadImageSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { folder, type, name } = validated.data;
  const extension = name.split(".").pop() ?? "jpg";

  const result = await getPresignedUploadUrl(folder, type, extension);
  return { success: true, data: result };
}
