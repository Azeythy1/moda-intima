export const CATEGORIES = ["Lingerie", "Cueca", "Fitness"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SUBCATEGORIES: Record<Category, readonly string[]> = {
  Lingerie: ["Calcinhas", "Tangas", "Conjunto"],
  Cueca: ["Box", "Sunga"],
  Fitness: ["Moleton", "Conjunto", "Macacão", "Blusinha", "Short", "Calça"],
};

export const SIZES = ["PP", "P", "M", "G", "GG", "XG", "Único"] as const;

export const CLOTHING_COLORS = [
  "Preto",
  "Branco",
  "Rosa",
  "Vermelho",
  "Nude",
  "Bege",
  "Azul",
  "Verde",
  "Roxo",
  "Estampado",
  "Outro",
] as const;

export const CONDITION_LABELS = {
  excelente: "Novo",
  bom: "Seminovo",
  regular: "Usado",
} as const;

export const STORE_NAME = "PolliShop";
export const STORE_TAGLINE = "Moda Íntima & Fitness";

export function getSubcategories(category: Category): readonly string[] {
  return SUBCATEGORIES[category];
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
