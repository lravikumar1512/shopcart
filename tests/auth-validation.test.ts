import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword, signToken, verifyToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

describe("Authentication, JWT and Password Security", () => {
  it("should securely hash password with bcrypt cost 12 and verify matching password", async () => {
    const rawPass = "SecureCustomer@123";
    const hashed = await hashPassword(rawPass);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPass);
    expect(hashed.startsWith("$2a$12$") || hashed.startsWith("$2b$12$")).toBe(true);

    const matches = await comparePassword(rawPass, hashed);
    expect(matches).toBe(true);

    const mismatch = await comparePassword("WrongPassword123", hashed);
    expect(mismatch).toBe(false);
  });

  it("should sign and verify valid JWT token payload", () => {
    const payload = {
      userId: "usr_test_12345",
      email: "test@shopkart.com",
      role: "CUSTOMER" as const,
      name: "Test User",
    };

    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });

  it("should enforce input validation rules on registration data via Zod", () => {
    // Valid input
    const valid = registerSchema.safeParse({
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      password: "Password123",
      phone: "9123456789",
    });
    expect(valid.success).toBe(true);

    // Invalid email
    const invalidEmail = registerSchema.safeParse({
      name: "Rahul",
      email: "invalid-email-format",
      password: "Password123",
    });
    expect(invalidEmail.success).toBe(false);

    // Short password (< 6 chars)
    const shortPass = registerSchema.safeParse({
      name: "Rahul",
      email: "rahul@gmail.com",
      password: "123",
    });
    expect(shortPass.success).toBe(false);
  });
});
