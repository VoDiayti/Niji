import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/queries/settings";
import { getPostSlugs, getActiveCategories } from "@/lib/queries/posts";
import { getMarketSlugs } from "@/lib/queries/markets";
import { getJobSlugs } from "@/lib/queries/job-orders";
import { getProgramSlugs } from "@/lib/queries/programs";

export const dynamic = "force-dynamic";

const STATIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/gioi-thieu", priority: 0.7, changeFrequency: "monthly" },
  { path: "/thi-truong", priority: 0.9, changeFrequency: "weekly" },
  { path: "/don-hang", priority: 0.9, changeFrequency: "daily" },
  { path: "/du-hoc-dao-tao", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tin-tuc", priority: 0.8, changeFrequency: "daily" },
  { path: "/cau-hoi-thuong-gap", priority: 0.6, changeFrequency: "monthly" },
  { path: "/lien-he", priority: 0.6, changeFrequency: "yearly" },
  { path: "/dang-ky-tu-van", priority: 0.8, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const [posts, categories, markets, jobs, programs] = await Promise.all([
    getPostSlugs().catch(() => []),
    getActiveCategories().catch(() => []),
    getMarketSlugs().catch(() => []),
    getJobSlugs().catch(() => []),
    getProgramSlugs().catch(() => []),
  ]);

  return [
    ...STATIC_PAGES.map((p) => ({ url: `${base}${p.path}`, lastModified: now, changeFrequency: p.changeFrequency, priority: p.priority })),
    ...markets.map((m) => ({ url: `${base}/thi-truong/${m.slug}`, lastModified: m.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...jobs.map((j) => ({ url: `${base}/don-hang/${j.slug}`, lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...programs.map((p) => ({ url: `${base}/du-hoc-dao-tao/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...categories.map((c) => ({ url: `${base}/tin-tuc/chuyen-muc/${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...posts.map((p) => ({ url: `${base}/tin-tuc/${p.slug}`, lastModified: p.updatedAt ?? p.publishedAt ?? now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
