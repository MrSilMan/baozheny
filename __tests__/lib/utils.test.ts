import {
  cn,
  formatCurrency,
  formatDate,
  slugify,
  truncate,
  calculatePriceRange,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("merges class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
      expect(cn("base", false && "not-included", "included")).toBe("base included");
    });

    it("handles Tailwind conflicts", () => {
      expect(cn("p-4", "p-6")).toBe("p-6");
    });
  });

  describe("formatCurrency", () => {
    it("formats USD correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
    });

    it("formats zero correctly", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });

    it("formats large numbers with commas", () => {
      expect(formatCurrency(1000000)).toBe("$1,000,000.00");
    });
  });

  describe("slugify", () => {
    it("converts spaces to hyphens", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("removes special characters", () => {
      expect(slugify("Hello, World! & More")).toBe("hello-world-more");
    });

    it("handles multiple spaces/hyphens", () => {
      expect(slugify("  hello   world  ")).toBe("hello-world");
    });

    it("converts to lowercase", () => {
      expect(slugify("UPPERCASE")).toBe("uppercase");
    });
  });

  describe("truncate", () => {
    it("truncates long text", () => {
      expect(truncate("Hello World", 5)).toBe("Hello...");
    });

    it("does not truncate short text", () => {
      expect(truncate("Hi", 10)).toBe("Hi");
    });

    it("handles exact length", () => {
      expect(truncate("Hello", 5)).toBe("Hello");
    });
  });

  describe("calculatePriceRange", () => {
    it("calculates correct price range", () => {
      const range = calculatePriceRange(10, 100);
      expect(range.min).toBe(10);
      expect(range.max).toBeGreaterThan(10);
      expect(range.bulk).toBeLessThan(10);
    });

    it("applies higher bulk discount for large orders", () => {
      const smallOrder = calculatePriceRange(10, 100);
      const largeOrder = calculatePriceRange(10, 1000);
      expect(largeOrder.bulk).toBeLessThan(smallOrder.bulk);
    });
  });
});
