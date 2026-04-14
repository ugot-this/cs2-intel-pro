import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("@/lib/stripe", () => ({ stripe: { webhooks: {}, subscriptions: {} } }));
vi.mock("@/lib/db", () => ({ prisma: { subscriptionPlan: { findFirst: vi.fn(), findUnique: vi.fn() }, subscription: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() }, user: { update: vi.fn() }, payment: { create: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));

describe("mapStripeStatus", () => {
  let mapStripeStatus: (status: string) => string;

  beforeAll(async () => {
    const mod = await import("@/app/api/stripe/webhook/route");
    mapStripeStatus = mod.mapStripeStatus;
  });

  it("maps active to ACTIVE", () => expect(mapStripeStatus("active")).toBe("ACTIVE"));
  it("maps canceled to CANCELED", () => expect(mapStripeStatus("canceled")).toBe("CANCELED"));
  it("maps past_due to PAST_DUE", () => expect(mapStripeStatus("past_due")).toBe("PAST_DUE"));
  it("maps trialing to TRIALING", () => expect(mapStripeStatus("trialing")).toBe("TRIALING"));
  it("maps incomplete to PAST_DUE", () => expect(mapStripeStatus("incomplete")).toBe("PAST_DUE"));
  it("defaults unknown status to CANCELED", () => expect(mapStripeStatus("foobar")).toBe("CANCELED"));
});
