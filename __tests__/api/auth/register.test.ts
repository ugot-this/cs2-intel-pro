import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    subscriptionPlan: { findUnique: vi.fn() },
    subscription: { create: vi.fn() },
  },
}));

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn(),
}));

import { validateRegistration } from "@/lib/auth-helpers";

describe("validateRegistration", () => {
  it("rejects missing email", () => {
    const result = validateRegistration({ email: "", password: "Password1!", name: "Test" });
    expect(result.valid).toBe(false);
    expect((result as { valid: false; error: string }).error).toContain("email");
  });

  it("rejects short password", () => {
    const result = validateRegistration({ email: "test@test.com", password: "short", name: "Test" });
    expect(result.valid).toBe(false);
    expect((result as { valid: false; error: string }).error).toContain("8 characters");
  });

  it("rejects missing name", () => {
    const result = validateRegistration({ email: "test@test.com", password: "Password1!", name: "" });
    expect(result.valid).toBe(false);
  });

  it("accepts valid input", () => {
    const result = validateRegistration({ email: "test@test.com", password: "Password1!", name: "Test" });
    expect(result.valid).toBe(true);
  });
});
