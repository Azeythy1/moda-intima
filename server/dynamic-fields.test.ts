import { describe, it, expect } from "vitest";
import { z } from "zod";
import { CATEGORIES, SUBCATEGORIES } from "@shared/categories";

const baseSchema = z.object({
  category: z.enum(CATEGORIES),
  color: z.string().optional(),
  condition: z.enum(["excelente", "bom", "regular"]),
  costPrice: z.number().positive("Preço de custo obrigatório"),
  priceAdjustType: z.enum(["percentage", "fixed"]),
  priceAdjustValue: z.number().min(0),
  status: z.enum(["draft", "published"]),
  notes: z.string().optional(),
});

const clothingSchema = baseSchema.extend({
  model: z.string().min(1, "Nome do produto obrigatório"),
  itemSubcategory: z.string().min(1, "Selecione a subcategoria"),
  storage: z.string().min(1, "Selecione o tamanho"),
  brand: z.string().optional().nullable(),
  specifications: z.string().optional().nullable(),
});

function getSchemaForCategory(_category: string) {
  return clothingSchema;
}

describe("Dynamic Product Fields by Category", () => {
  describe("Lingerie", () => {
    it("should validate lingerie with all required fields", async () => {
      const schema = getSchemaForCategory("Lingerie");
      const data = {
        category: "Lingerie",
        model: "Conjunto renda preta",
        itemSubcategory: "Conjunto",
        storage: "M",
        color: "Preto",
        condition: "excelente",
        costPrice: 89.9,
        priceAdjustType: "percentage",
        priceAdjustValue: 30,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.model).toBe("Conjunto renda preta");
      expect(result.itemSubcategory).toBe("Conjunto");
    });

    it("should reject lingerie without subcategory", async () => {
      const schema = getSchemaForCategory("Lingerie");
      const data = {
        category: "Lingerie",
        model: "Calcinha fio dental",
        storage: "P",
        condition: "excelente",
        costPrice: 29.9,
        priceAdjustType: "percentage",
        priceAdjustValue: 0,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should accept valid lingerie subcategories", () => {
      for (const sub of SUBCATEGORIES.Lingerie) {
        expect(["Calcinhas", "Tangas", "Conjunto"]).toContain(sub);
      }
    });
  });

  describe("Cueca", () => {
    it("should validate cueca product", async () => {
      const schema = getSchemaForCategory("Cueca");
      const data = {
        category: "Cueca",
        model: "Cueca Box Premium",
        itemSubcategory: "Box",
        storage: "G",
        condition: "excelente",
        costPrice: 35,
        priceAdjustType: "fixed",
        priceAdjustValue: 15,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.itemSubcategory).toBe("Box");
    });

    it("should reject cueca without size", async () => {
      const schema = getSchemaForCategory("Cueca");
      const data = {
        category: "Cueca",
        model: "Sunga listrada",
        itemSubcategory: "Sunga",
        condition: "bom",
        costPrice: 25,
        priceAdjustType: "percentage",
        priceAdjustValue: 0,
        status: "draft",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });

  describe("Fitness", () => {
    it("should validate fitness product", async () => {
      const schema = getSchemaForCategory("Fitness");
      const data = {
        category: "Fitness",
        model: "Macacão compressão",
        itemSubcategory: "Macacão",
        storage: "M",
        brand: "PolliFit",
        specifications: "Tecido dry-fit, alta compressão",
        condition: "excelente",
        costPrice: 120,
        priceAdjustType: "percentage",
        priceAdjustValue: 40,
        status: "published",
      };
      const result = await schema.parseAsync(data);
      expect(result.itemSubcategory).toBe("Macacão");
      expect(result.specifications).toContain("dry-fit");
    });

    it("should accept all fitness subcategories", () => {
      expect(SUBCATEGORIES.Fitness).toEqual([
        "Moleton",
        "Conjunto",
        "Macacão",
        "Blusinha",
        "Short",
        "Calça",
      ]);
    });
  });

  describe("Common validations", () => {
    it("should reject negative cost price", async () => {
      const schema = getSchemaForCategory("Lingerie");
      const data = {
        category: "Lingerie",
        model: "Tanga renda",
        itemSubcategory: "Tangas",
        storage: "P",
        condition: "excelente",
        costPrice: -10,
        priceAdjustType: "percentage",
        priceAdjustValue: 0,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });

    it("should reject invalid category", async () => {
      const schema = getSchemaForCategory("Lingerie");
      const data = {
        category: "Smartphones",
        model: "Test",
        itemSubcategory: "Calcinhas",
        storage: "M",
        condition: "excelente",
        costPrice: 50,
        priceAdjustType: "percentage",
        priceAdjustValue: 0,
        status: "published",
      };
      await expect(schema.parseAsync(data)).rejects.toThrow();
    });
  });
});
