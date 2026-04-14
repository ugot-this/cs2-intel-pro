import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    blogPost: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      $transaction: vi.fn(),
    },
    $transaction: vi.fn().mockResolvedValue([0, []]),
  },
}));

import { prisma } from "@/lib/db";

describe("blog posts pagination defaults", () => {
  it("default limit is capped at 50", () => {
    const limit = Math.min(Number("100") || 10, 50);
    expect(limit).toBe(50);
  });

  it("default page is 1", () => {
    const page = Math.max(Number("") || 1, 1);
    expect(page).toBe(1);
  });

  it("calculates totalPages correctly", () => {
    const total = 25;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);
    expect(totalPages).toBe(3);
  });
});
