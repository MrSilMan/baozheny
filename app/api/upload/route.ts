import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPresignedUploadUrl } from "@/lib/s3";
import { uploadImageSchema } from "@/lib/validations/upload.schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validated = uploadImageSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error.errors[0].message }, { status: 400 });
  }

  const { folder, type, name } = validated.data;
  const extension = name.split(".").pop() ?? "jpg";

  const result = await getPresignedUploadUrl(folder, type, extension);
  return NextResponse.json(result);
}
