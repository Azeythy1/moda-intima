import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categoryEnum = mysqlEnum("category", [
  "Lingerie",
  "Cueca",
  "Fitness",
]);

export const iphones = mysqlTable("iphones", {
  id: int("id").autoincrement().primaryKey(),
  category: categoryEnum.default("Lingerie").notNull(),
  
  // Campos genéricos (todos os produtos)
  model: varchar("model", { length: 64 }).notNull(),
  color: varchar("color", { length: 64 }),
  condition: mysqlEnum("condition", ["excelente", "bom", "regular"]).default("bom").notNull(),
  
  // Campos Smartphones/Tablet
  storage: varchar("storage", { length: 16 }), // 64GB, 128GB, 256GB, 512GB, 1TB
  batteryHealth: int("batteryHealth"), // percentage 0-100
  repairs: text("repairs"), // description of repairs done
  
  // Campos Notebook/Computadores
  processor: varchar("processor", { length: 128 }), // Intel i5, AMD Ryzen 5, etc
  ram: varchar("ram", { length: 32 }), // 8GB, 16GB, 32GB, etc
  storageCapacity: varchar("storageCapacity", { length: 128 }), // SSD 256GB, HDD 1TB, etc
  gpu: varchar("gpu", { length: 128 }), // NVIDIA GTX, Intel Iris, etc
  powerSupply: varchar("powerSupply", { length: 64 }), // 500W, 650W, etc (Computadores)
  screen: varchar("screen", { length: 64 }), // 15.6", 17", etc (Notebook)
  cooler: varchar("cooler", { length: 128 }), // Cooler do processador (Computadores)
  cabinet: varchar("cabinet", { length: 128 }), // Gabinete (Computadores)
  
  // Campos Periféricos/Acessórios
  itemType: varchar("itemType", { length: 64 }), // mouse, teclado, monitor, capa, etc
  itemCategory: mysqlEnum("itemCategory", ["Informática", "Acessórios"]), // Categoria para Periféricos
  itemSubcategory: varchar("itemSubcategory", { length: 64 }), // mouse, teclado, mousepad, cabo, carregador, power bank, mag safe
  brand: varchar("brand", { length: 64 }), // marca do produto
  specifications: text("specifications"), // especificações adicionais
  compatibility: varchar("compatibility", { length: 256 }), // compatibilidade (ex: iPhone 13-15)

  // Pricing
  costPrice: decimal("costPrice", { precision: 10, scale: 2, mode: "number" }).notNull(),
  priceAdjustType: mysqlEnum("priceAdjustType", ["percentage", "fixed"]).default("percentage").notNull(),
  priceAdjustValue: decimal("priceAdjustValue", { precision: 10, scale: 2, mode: "number" }).default(0).notNull(),
  cashPrice: decimal("cashPrice", { precision: 10, scale: 2, mode: "number" }).notNull(),

  // Installment config: JSON array of { installments: number, rateId: number }
  installmentConfig: json("installmentConfig"),

  // Status
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  notes: text("notes"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Iphone = typeof iphones.$inferSelect;
export type InsertIphone = typeof iphones.$inferInsert;
export type Category = "Lingerie" | "Cueca" | "Fitness";

export const iphonePhotos = mysqlTable("iphone_photos", {
  id: int("id").autoincrement().primaryKey(),
  iphoneId: int("iphoneId").notNull().references(() => iphones.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IphonePhoto = typeof iphonePhotos.$inferSelect;
export type InsertIphonePhoto = typeof iphonePhotos.$inferInsert;

export const installmentRates = mysqlTable("installment_rates", {
  id: int("id").autoincrement().primaryKey(),
  installments: int("installments").notNull(),
  rate: decimal("rate", { precision: 5, scale: 2, mode: "number" }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstallmentRate = typeof installmentRates.$inferSelect;
export type InsertInstallmentRate = typeof installmentRates.$inferInsert;
