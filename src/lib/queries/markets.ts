import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Tất cả thị trường đang hoạt động (cache theo request) */
export const getActiveMarkets = cache(async () =>
  prisma.market.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })
);

/** Thị trường nổi bật cho trang chủ */
export async function getFeaturedMarkets(limit = 6) {
  return prisma.market.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    take: limit,
  });
}

/** Chi tiết thị trường theo slug (chỉ thị trường đang hoạt động) */
export async function getMarketBySlug(slug: string) {
  return prisma.market.findFirst({ where: { slug, isActive: true } });
}

/** Danh sách { id, name } dùng cho ô chọn "Thị trường quan tâm" trong form */
export const getMarketOptions = cache(async () =>
  prisma.market.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })
);

/** Danh sách { slug, name } dùng cho bộ lọc đơn hàng, footer */
export const getMarketLinks = cache(async () =>
  prisma.market.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, countryCode: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })
);

/** Dùng cho sitemap */
export async function getMarketSlugs() {
  return prisma.market.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
}
