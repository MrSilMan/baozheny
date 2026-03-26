import { createProductSchema, productFilterSchema } from "@/lib/validations/product.schema";

describe("Product Validation Schemas", () => {
  const validProduct = {
    title: "Premium LED Strip Lights 5M WiFi",
    description: "These are high quality LED strip lights that work great for home decoration and commercial use.",
    minOrder: 50,
    unit: "roll",
    priceUSD: 8.50,
    stock: 1000,
    categoryId: "clxyz123",
    images: [{ url: "https://example.com/image.jpg", order: 0 }],
  };

  describe("createProductSchema", () => {
    it("should validate a valid product", () => {
      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should reject title shorter than 5 chars", () => {
      const result = createProductSchema.safeParse({ ...validProduct, title: "LED" });
      expect(result.success).toBe(false);
    });

    it("should reject description shorter than 20 chars", () => {
      const result = createProductSchema.safeParse({ ...validProduct, description: "Too short" });
      expect(result.success).toBe(false);
    });

    it("should reject price of 0", () => {
      const result = createProductSchema.safeParse({ ...validProduct, priceUSD: 0 });
      expect(result.success).toBe(false);
    });

    it("should reject negative minOrder", () => {
      const result = createProductSchema.safeParse({ ...validProduct, minOrder: 0 });
      expect(result.success).toBe(false);
    });

    it("should require at least one image", () => {
      const result = createProductSchema.safeParse({ ...validProduct, images: [] });
      expect(result.success).toBe(false);
    });

    it("should use default values for optional fields", () => {
      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.published).toBe(false);
        expect(result.data.tags).toEqual([]);
        expect(result.data.variants).toEqual([]);
      }
    });
  });

  describe("productFilterSchema", () => {
    it("should apply defaults when no filters given", () => {
      const result = productFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(24);
        expect(result.data.sort).toBe("createdAt_desc");
      }
    });

    it("should coerce string numbers", () => {
      const result = productFilterSchema.safeParse({ page: "2", limit: "12", minPrice: "5.00" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(12);
        expect(result.data.minPrice).toBe(5);
      }
    });

    it("should reject limit over 100", () => {
      const result = productFilterSchema.safeParse({ limit: "200" });
      expect(result.success).toBe(false);
    });
  });
});
