import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth.schema";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should validate a valid login", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    const validData = {
      name: "John Smith",
      email: "john@example.com",
      password: "SecureP@ss1",
      confirmPassword: "SecureP@ss1",
      role: "BUYER" as const,
      acceptTerms: true as const,
    };

    it("should validate a valid registration", () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject password without uppercase", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "secure@pass1",
        confirmPassword: "secure@pass1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "SecurePass@",
        confirmPassword: "SecurePass@",
      });
      expect(result.success).toBe(false);
    });

    it("should reject mismatched passwords", () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: "SecureP@ss1",
        confirmPassword: "DifferentP@ss2",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.errors.find((e) => e.path.includes("confirmPassword"));
        expect(confirmError).toBeTruthy();
      }
    });

    it("should reject name shorter than 2 chars", () => {
      const result = registerSchema.safeParse({ ...validData, name: "J" });
      expect(result.success).toBe(false);
    });

    it("should require acceptTerms to be true", () => {
      const result = registerSchema.safeParse({
        ...validData,
        acceptTerms: false as unknown as true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate a valid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "invalid" });
      expect(result.success).toBe(false);
    });
  });
});
