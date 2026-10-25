import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, settings } from "@/db";
import type { Setting } from "@/db/types";

/** Giá trị mặc định khi chưa seed – để website không lỗi trắng trang */
export const DEFAULT_SETTINGS: Setting = {
  id: 1,
  companyName: "Công ty Xuất khẩu Lao động",
  shortName: "XKLĐ",
  slogan: "Vững bước tương lai – Vươn tầm quốc tế",
  logo: "/logo-full.svg",
  licenseNumber: null,
  licenseIssuer: null,
  taxCode: null,
  hotline: "0900 000 000",
  zalo: null,
  email: null,
  address: null,
  mapEmbedUrl: null,
  workingHours: null,
  facebook: null,
  youtube: null,
  tiktok: null,
  messenger: null,
  foundedYear: null,
  statWorkers: null,
  statYears: null,
  statPartners: null,
  statMarkets: null,
  aboutShort: null,
  aboutContent: null,
  vision: null,
  mission: null,
  metaTitle: null,
  metaDescription: null,
  ogImage: "/og-default.jpg",
  updatedAt: new Date(0),
};

/**
 * Lấy cài đặt chung (1 dòng, id = 1). Dùng React cache() để chỉ truy vấn 1 lần mỗi request
 * dù được gọi ở nhiều component (layout, header, footer, metadata...).
 */
export const getSettings = cache(async (): Promise<Setting> => {
  const row = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  return row ?? DEFAULT_SETTINGS;
});

/** URL gốc của website (dùng cho metadata, sitemap, JSON-LD) */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
