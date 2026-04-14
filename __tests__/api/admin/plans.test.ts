import { describe, it, expect } from "vitest";
import { validatePlanInput } from "@/app/api/admin/plans/route";

describe("validatePlanInput", () => {
  it("rejects missing name", () => {
    const result = validatePlanInput({ name: "", slug: "test", price: 10 });
    expect(result.valid).toBe(false);
  });
  it("rejects missing slug", () => {
    const result = validatePlanInput({ name: "Test", slug: "", price: 10 });
    expect(result.valid).toBe(false);
  });
  it("rejects negative price", () => {
    const result = validatePlanInput({ name: "Test", slug: "test", price: -5 });
    expect(result.valid).toBe(false);
  });
  it("accepts valid input", () => {
    const result = validatePlanInput({ name: "Pro", slug: "pro", price: 14.99 });
    expect(result.valid).toBe(true);
  });
});
