import { describe, it, expect } from "vitest";
import { hasAccess, PLAN_TIERS, getPlanTier } from "@/lib/subscription";

describe("getPlanTier", () => {
  it("returns 0 for free", () => {
    expect(getPlanTier("free")).toBe(0);
  });
  it("returns 1 for pro", () => {
    expect(getPlanTier("pro")).toBe(1);
  });
  it("returns 2 for vip", () => {
    expect(getPlanTier("vip")).toBe(2);
  });
  it("returns 0 for unknown plan", () => {
    expect(getPlanTier("unknown")).toBe(0);
  });
});

describe("hasAccess", () => {
  it("free user can access free content", () => {
    expect(hasAccess("free", "free")).toBe(true);
  });
  it("free user cannot access pro content", () => {
    expect(hasAccess("free", "pro")).toBe(false);
  });
  it("pro user can access free content", () => {
    expect(hasAccess("pro", "free")).toBe(true);
  });
  it("pro user can access pro content", () => {
    expect(hasAccess("pro", "pro")).toBe(true);
  });
  it("pro user cannot access vip content", () => {
    expect(hasAccess("pro", "vip")).toBe(false);
  });
  it("vip user can access everything", () => {
    expect(hasAccess("vip", "free")).toBe(true);
    expect(hasAccess("vip", "pro")).toBe(true);
    expect(hasAccess("vip", "vip")).toBe(true);
  });
});
