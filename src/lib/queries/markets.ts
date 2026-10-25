import "server-only";
import { cache } from "react";
import { and, asc, eq } from "drizzle-orm";
import { db, markets } from "@/db";

const activeMarket = eq(markets.isActive, true);
const marketOrder = [asc(markets.order), asc(markets.name)];

/** Tất cả thị trường đang hoạt động (cache theo request) */
export const getActiveMarkets = cache(async () =>
  db.query.markets.findMany({ where: activeMarket, orderBy: marketOrder })
);

/** Thị trường nổi bật cho trang chủ */
export async function getFeaturedMarkets(limit = 6) {
  return db.query.markets.findMany({
    where: and(activeMarket, eq(markets.isFeatured, true)),
    orderBy: marketOrder,
    limit,
  });
}

/** Chi tiết thị trường theo slug (chỉ thị trường đang hoạt động) */
export async function getMarketBySlug(slug: string) {
  return db.query.markets.findFirst({ where: and(eq(markets.slug, slug), activeMarket) });
}

/** Danh sách { id, name } dùng cho ô chọn "Thị trường quan tâm" trong form */
export const getMarketOptions = cache(async () =>
  db.query.markets.findMany({
    where: activeMarket,
    columns: { id: true, name: true },
    orderBy: marketOrder,
  })
);

/** Danh sách { slug, name } dùng cho bộ lọc đơn hàng, footer */
export const getMarketLinks = cache(async () =>
  db.query.markets.findMany({
    where: activeMarket,
    columns: { slug: true, name: true, countryCode: true },
    orderBy: marketOrder,
  })
);

/** Dùng cho sitemap */
export async function getMarketSlugs() {
  return db.query.markets.findMany({ where: activeMarket, columns: { slug: true, updatedAt: true } });
}
