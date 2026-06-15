import { TRPCError } from "@trpc/server";

import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllIphones,
  getIphoneById,
  createIphone,
  updateIphone,
  deleteIphone,
  getPhotosByIphoneId,
  addIphonePhoto,
  deleteIphonePhoto,
  setPrimaryPhoto,
  getAllRates,
  createRate,
  updateRate,
  deleteRate,
} from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { applyPendingMigrations } from "./apply-migrations";
import { CATEGORIES } from "@shared/categories";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador." });
  }
  return next({ ctx });
});

// ─── Price calculation helper ─────────────────────────────────────────────────
function calcCashPrice(costPrice: number, adjustType: "percentage" | "fixed", adjustValue: number): number {
  if (adjustType === "percentage") {
    return costPrice * (1 + adjustValue / 100);
  }
  return costPrice + adjustValue;
}

function calcInstallmentPrice(cashPrice: number, rate: number, installments: number) {
  // Simple interest: total = cashPrice * (1 + rate/100)
  const total = cashPrice * (1 + rate / 100);
  const perInstallment = total / installments;
  return { total: parseFloat(total.toFixed(2)), perInstallment: parseFloat(perInstallment.toFixed(2)) };
}

// ─── Schemas ──────────────────────────────────────────────────────────────────
const iphoneInput = z.object({
  category: z.enum(CATEGORIES).default("Lingerie"),
  model: z.string().min(1),
  storage: z.string().optional().nullable(),
  color: z.string().optional(),
  batteryHealth: z.number().int().min(0).max(100).optional().nullable(),
  repairs: z.string().optional().nullable(),
  condition: z.enum(["excelente", "bom", "regular"]).default("bom"),
  costPrice: z.number().positive(),
  priceAdjustType: z.enum(["percentage", "fixed"]).default("percentage"),
  priceAdjustValue: z.number().min(0).default(0),
  processor: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  storageCapacity: z.string().optional().nullable(),
  gpu: z.string().optional().nullable(),
  powerSupply: z.string().optional().nullable(),
  screen: z.string().optional().nullable(),
  itemType: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  specifications: z.string().optional().nullable(),
  compatibility: z.string().optional().nullable(),
  cooler: z.string().optional().nullable(),
  cabinet: z.string().optional().nullable(),
  itemCategory: z.enum(["Informática", "Acessórios"]).optional().nullable(),
  itemSubcategory: z.string().optional().nullable(),
  installmentConfig: z.array(z.object({ installments: z.number(), rateId: z.number() })).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  notes: z.string().optional().nullable(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Public: Catalog ────────────────────────────────────────────────────────
  catalog: router({
    list: publicProcedure.query(async () => {
      const items = await getAllIphones(false);
      const result = [];
      for (const item of items) {
        const photos = await getPhotosByIphoneId(item.id);
        const rates = await getAllRates(true);
        // Build installment options
        const installmentOptions: Array<{ installments: number; rate: number; total: number; perInstallment: number }> = [];
        const config = item.installmentConfig as Array<{ installments: number; rateId: number }> | null;
        if (config && Array.isArray(config)) {
          for (const cfg of config) {
            const rateObj = rates.find(r => r.id === cfg.rateId);
            if (rateObj) {
              const cashPrice = parseFloat(item.cashPrice as unknown as string);
              const rateVal = parseFloat(rateObj.rate as unknown as string);
              const calc = calcInstallmentPrice(cashPrice, rateVal, cfg.installments);
              installmentOptions.push({ installments: cfg.installments, rate: rateVal, ...calc });
            }
          }
        }
        result.push({
          id: item.id,
          category: item.category,
          model: item.model,
          storage: item.storage,
          color: item.color,
          batteryHealth: item.batteryHealth,
          repairs: item.repairs,
          condition: item.condition,
          cashPrice: parseFloat(item.cashPrice as unknown as string),
        installmentOptions,
        photos: photos.map(p => ({ id: p.id, url: p.url, isPrimary: p.isPrimary })),
        // Include all category fields
        brand: item.brand,
        processor: item.processor,
        ram: item.ram,
        storageCapacity: item.storageCapacity,
        gpu: item.gpu,
        powerSupply: item.powerSupply,
        screen: item.screen,
        cooler: item.cooler,
        cabinet: item.cabinet,
        itemType: item.itemType,
        itemCategory: item.itemCategory,
        itemSubcategory: item.itemSubcategory,
        specifications: item.specifications,
        compatibility: item.compatibility,
        createdAt: item.createdAt,
      });
    }
    return result;
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const item = await getIphoneById(input.id);
    if (!item || item.status !== "published") throw new TRPCError({ code: "NOT_FOUND" });
    const photos = await getPhotosByIphoneId(item.id);
    const rates = await getAllRates(true);
    const installmentOptions: Array<{ installments: number; rate: number; total: number; perInstallment: number }> = [];
    const config = item.installmentConfig as Array<{ installments: number; rateId: number }> | null;
    if (config && Array.isArray(config)) {
      for (const cfg of config) {
        const rateObj = rates.find(r => r.id === cfg.rateId);
        if (rateObj) {
          const cashPrice = parseFloat(item.cashPrice as unknown as string);
          const rateVal = parseFloat(rateObj.rate as unknown as string);
          const calc = calcInstallmentPrice(cashPrice, rateVal, cfg.installments);
          installmentOptions.push({ installments: cfg.installments, rate: rateVal, ...calc });
        }
      }
    }
    return {
      ...item,
      cashPrice: parseFloat(item.cashPrice as unknown as string),
      installmentOptions,
      photos: photos.map(p => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, sortOrder: p.sortOrder })),
    };
  }),
  }),

  // ─── Admin: iPhones ─────────────────────────────────────────────────────────
  admin: router({
    listIphones: adminProcedure.query(async () => {
      const items = await getAllIphones(true);
      const result = [];
      for (const item of items) {
        const photos = await getPhotosByIphoneId(item.id);
        result.push({
          ...item,
          costPrice: parseFloat(item.costPrice as unknown as string),
          cashPrice: parseFloat(item.cashPrice as unknown as string),
          priceAdjustValue: parseFloat(item.priceAdjustValue as unknown as string),
          photos: photos.map(p => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, fileKey: p.fileKey })),
        });
      }
      return result;
    }),

    getIphone: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const item = await getIphoneById(input.id);
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      const photos = await getPhotosByIphoneId(item.id);
      return {
        ...item,
        costPrice: parseFloat(item.costPrice as unknown as string),
        cashPrice: parseFloat(item.cashPrice as unknown as string),
        priceAdjustValue: parseFloat(item.priceAdjustValue as unknown as string),
        photos: photos.map(p => ({ id: p.id, url: p.url, isPrimary: p.isPrimary, fileKey: p.fileKey, sortOrder: p.sortOrder })),
      };
    }),

    createIphone: adminProcedure.input(iphoneInput).mutation(async ({ input }) => {
      const cashPrice = calcCashPrice(input.costPrice, input.priceAdjustType, input.priceAdjustValue);
      const { installmentConfig, ...rest } = input;
      await createIphone({
        ...rest,
        category: input.category as any,
        color: input.color ?? null,
        repairs: input.repairs ?? null,
        costPrice: String(input.costPrice) as unknown as number,
        priceAdjustValue: String(input.priceAdjustValue) as unknown as number,
        cashPrice: String(cashPrice) as unknown as number,
        installmentConfig: installmentConfig ?? null,
        notes: input.notes ?? null,
      } as any);
      // Get last inserted
      const all = await getAllIphones(true);
      return all[0];
    }),

    updateIphone: adminProcedure
      .input(z.object({ id: z.number(), data: iphoneInput.partial() }))
      .mutation(async ({ input }) => {
        const existing = await getIphoneById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        const costPrice = input.data.costPrice ?? parseFloat(existing.costPrice as unknown as string);
        const adjustType = input.data.priceAdjustType ?? existing.priceAdjustType;
        const adjustValue = input.data.priceAdjustValue ?? parseFloat(existing.priceAdjustValue as unknown as string);
        const cashPrice = calcCashPrice(costPrice, adjustType, adjustValue);
        const updateData: Record<string, unknown> = { ...input.data };
        updateData.costPrice = costPrice.toFixed(2);
        updateData.priceAdjustValue = adjustValue.toFixed(2);
        updateData.cashPrice = cashPrice.toFixed(2);
        if (input.data.installmentConfig !== undefined) {
          updateData.installmentConfig = input.data.installmentConfig;
        }
        await updateIphone(input.id, updateData as Parameters<typeof updateIphone>[1]);
        return { success: true };
      }),

    deleteIphone: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteIphone(input.id);
      return { success: true };
    }),

    // ─── Photos ───────────────────────────────────────────────────────────────
    uploadPhoto: adminProcedure
      .input(z.object({
        iphoneId: z.number(),
        filename: z.string(),
        mimeType: z.string(),
        base64: z.string(),
        isPrimary: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const fileKey = `iphones/${input.iphoneId}/${nanoid()}-${input.filename}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await addIphonePhoto({
          iphoneId: input.iphoneId,
          url,
          fileKey,
          isPrimary: input.isPrimary,
          sortOrder: 0,
        });
        return { url, fileKey };
      }),

    deletePhoto: adminProcedure.input(z.object({ photoId: z.number() })).mutation(async ({ input }) => {
      const photo = await deleteIphonePhoto(input.photoId);
      return { success: true, fileKey: photo?.fileKey };
    }),

    setPrimaryPhoto: adminProcedure
      .input(z.object({ iphoneId: z.number(), photoId: z.number() }))
      .mutation(async ({ input }) => {
        await setPrimaryPhoto(input.iphoneId, input.photoId);
        return { success: true };
      }),

    // ─── Installment Rates ────────────────────────────────────────────────────
    listRates: adminProcedure.query(async () => {
      const rates = await getAllRates(false);
      return rates.map(r => ({ ...r, rate: parseFloat(r.rate as unknown as string) }));
    }),

    createRate: adminProcedure
      .input(z.object({ installments: z.number().int().min(2).max(24), rate: z.number().min(0) }))
      .mutation(async ({ input }) => {
        await createRate({ installments: input.installments, rate: input.rate.toFixed(2) });
        return { success: true };
      }),

    updateRate: adminProcedure
      .input(z.object({ id: z.number(), installments: z.number().int().min(2).max(24).optional(), rate: z.number().min(0).optional(), isActive: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = {};
        if (data.installments !== undefined) updateData.installments = data.installments;
        if (data.rate !== undefined) updateData.rate = data.rate.toFixed(2);
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        await updateRate(id, updateData as Parameters<typeof updateRate>[1]);
        return { success: true };
      }),

    deleteRate: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await deleteRate(input.id);
      return { success: true };
    }),

    // Public rates (for iphone form)
    getRatesPublic: adminProcedure.query(async () => {
      const rates = await getAllRates(true);
      return rates.map(r => ({ ...r, rate: parseFloat(r.rate as unknown as string) }));
    }),
  }),

  // Public rates for catalog display
  rates: router({
    listActive: publicProcedure.query(async () => {
      const rates = await getAllRates(true);
      return rates.map(r => ({ id: r.id, installments: r.installments, rate: parseFloat(r.rate as unknown as string) }));
    }),
  }),

  // Admin: Database migrations
  migrations: router({
    runMigrations: adminProcedure.mutation(async () => {
      const success = await applyPendingMigrations();
      return { success };
    }),
  }),
});

export type AppRouter = typeof appRouter;

// Auto-apply migrations on startup (disabled - use admin endpoint instead)
// setTimeout(() => {
//   applyPendingMigrations().catch(err => console.error("[Startup] Migration error:", err));
// }, 2000);
