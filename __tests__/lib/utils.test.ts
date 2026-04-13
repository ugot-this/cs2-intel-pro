import { describe, it, expect } from "vitest";
import { slugify, formatCurrency, cn } from "@/lib/utils";

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("removes special characters", () => {
    expect(slugify("NAVI vs. FaZe!")).toBe("navi-vs-faze");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("  Hello  ")).toBe("hello");
  });
  it("collapses multiple hyphens", () => {
    expect(slugify("a---b")).toBe("a-b");
  });
});

describe("formatCurrency", () => {
  it("formats USD amount", () => {
    expect(formatCurrency(14.99, "usd")).toBe("$14.99");
  });
  it("formats zero as free", () => {
    expect(formatCurrency(0, "usd")).toBe("Free");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });
});
