"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis";
import { sendEmail } from "@/lib/email";
import { logAuthEvent } from "@/lib/logger";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth.schema";
import type {
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/lib/validations/auth.schema";
import type { ActionResponse } from "@/types/actions";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function registerUser(
  data: RegisterInput
): Promise<ActionResponse<{ userId: string }>> {
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { name, email, password } = validated.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = uuidv4();

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "BUYER" },
  });

  await redis.set(
    REDIS_KEYS.emailVerify(verifyToken),
    { userId: user.id, email },
    REDIS_TTL.emailVerify
  );

  // Send verification email (non-blocking)
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verifyToken}`;
  sendEmail({
    to: email,
    subject: "Welcome to BaoZhen — Verify your email",
    text: `Hi ${name ?? "there"}, verify your email: ${verifyUrl}`,
  }).catch(() => {});

  logAuthEvent("register", user.id);
  return { success: true, data: { userId: user.id } };
}

export async function loginWithCredentials(
  _prevState: ActionResponse<undefined>,
  formData: FormData
): Promise<ActionResponse<undefined>> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Authentication failed. Please try again." };
      }
    }
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export async function sendPasswordResetEmail(
  data: ForgotPasswordInput
): Promise<ActionResponse<undefined>> {
  const validated = forgotPasswordSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { email } = validated.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (user) {
    const resetToken = uuidv4();
    await redis.set(
      REDIS_KEYS.passwordReset(resetToken),
      { userId: user.id, email },
      REDIS_TTL.passwordReset
    );
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    sendEmail({
      to: email,
      subject: "Reset your BaoZhen password",
      text: `Reset your password: ${resetUrl}`,
    }).catch(() => {});
    logAuthEvent("password_reset", user.id, { step: "email_sent" });
  }

  return { success: true, data: undefined };
}

export async function resetPassword(
  data: ResetPasswordInput
): Promise<ActionResponse<undefined>> {
  const validated = resetPasswordSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.errors[0].message };
  }

  const { token, password } = validated.data;

  const stored = await redis.get<{ userId: string; email: string }>(
    REDIS_KEYS.passwordReset(token)
  );
  if (!stored) {
    return { success: false, error: "Reset link has expired or is invalid" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: stored.userId },
    data: { passwordHash },
  });

  await redis.del(REDIS_KEYS.passwordReset(token));
  logAuthEvent("password_reset", stored.userId, { step: "completed" });
  return { success: true, data: undefined };
}

export async function verifyEmail(token: string): Promise<ActionResponse<undefined>> {
  const stored = await redis.get<{ userId: string; email: string }>(
    REDIS_KEYS.emailVerify(token)
  );
  if (!stored) {
    return { success: false, error: "Verification link has expired or is invalid" };
  }

  await prisma.user.update({
    where: { id: stored.userId },
    data: { emailVerified: new Date() },
  });
  await redis.del(REDIS_KEYS.emailVerify(token));
  logAuthEvent("email_verify", stored.userId);
  return { success: true, data: undefined };
}
