"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, ne } from "drizzle-orm";
import { db, jobOrders, markets } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { marketSchema, type MarketFormValues } from "@/lib/validations/market";

const ADMIN_PATH = "/admin/thi-truong";

function revalidateMarketPages(slugs: (string | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/thi-truong");
  revalidatePath("/don-hang");
  revalidatePath("/sitemap.xml");
  revalidatePath(ADMIN_PATH);
  for (const slug of new Set(slugs.filter(Boolean) as string[])) revalidatePath(`/thi-truong/${slug}`);
}

/** Tạo slug duy nhất (bỏ qua bản ghi đang sửa) */
async function resolveSlug(preferred: string | undefined, name: string, excludeId?: string) {
  const base = slugify(preferred ?? "") || slugify(name) || "thi-truong";
  return uniqueSlug(base, async (slug) => {
    const found = await db.query.markets.findFirst({
      columns: { id: true },
      where: and(eq(markets.slug, slug), excludeId ? ne(markets.id, excludeId) : undefined),
    });
    return !!found;
  });
}

/** Textarea mỗi dòng một mục → String[] */
function splitLines(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** HTML chỉ có đoạn trống (<p></p>) → null */
function htmlOrNull(html: string | undefined): string | null {
  if (!html) return null;
  const empty = /^(\s*<p[^>]*>(\s|<br\s*\/?>|&nbsp;)*<\/p>\s*)*$/i.test(html);
  return empty ? null : html;
}

/** Chuyển giá trị form (chuỗi) sang dữ liệu ghi DB */
function toData(v: MarketFormValues) {
  return {
    name: v.name,
    countryCode: v.countryCode || null,
    image: v.image || null,
    summary: v.summary || null,
    description: htmlOrNull(v.description) ?? "",
    requirements: htmlOrNull(v.requirements),
    salaryRange: v.salaryRange || null,
    cost: v.cost || null,
    duration: v.duration || null,
    industries: JSON.stringify(splitLines(v.industriesText)),
    highlights: JSON.stringify(splitLines(v.highlightsText)),
    isFeatured: v.isFeatured,
    isActive: v.isActive,
    order: v.order ? Number(v.order) : 0,
    metaTitle: v.metaTitle || null,
    metaDescription: v.metaDescription || null,
  };
}

export async function createMarket(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = marketSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const slug = await resolveSlug(parsed.data.slug, parsed.data.name);
    const [market] = await db.insert(markets).values({ ...toData(parsed.data), slug }).returning({ id: markets.id });
    revalidateMarketPages([slug]);
    return ok({ id: market.id }, "Đã tạo thị trường");
  });
}

export async function updateMarket(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = marketSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const existing = await db.query.markets.findFirst({ columns: { slug: true }, where: eq(markets.id, id) });
    if (!existing) return fail("Không tìm thấy thị trường");

    const slug = await resolveSlug(parsed.data.slug, parsed.data.name, id);
    await db.update(markets).set({ ...toData(parsed.data), slug }).where(eq(markets.id, id));
    revalidateMarketPages([existing.slug, slug]);
    revalidatePath(`${ADMIN_PATH}/${id}`);
    return ok({ id }, "Đã lưu thị trường");
  });
}

export async function deleteMarket(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const market = await db.query.markets.findFirst({ columns: { slug: true }, where: eq(markets.id, id) });
    if (!market) return fail("Không tìm thấy thị trường");

    const [{ jobCount }] = await db.select({ jobCount: count() }).from(jobOrders).where(eq(jobOrders.marketId, id));
    if (jobCount > 0) {
      return fail(`Thị trường đang có ${jobCount} đơn hàng, hãy xóa hoặc chuyển đơn hàng trước`);
    }
    await db.delete(markets).where(eq(markets.id, id));
    revalidateMarketPages([market.slug]);
    return ok(undefined, "Đã xóa thị trường");
  });
}

export async function toggleMarketActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [market] = await db.update(markets).set({ isActive }).where(eq(markets.id, id)).returning({ slug: markets.slug });
    if (!market) return fail("Không tìm thấy thị trường");
    revalidateMarketPages([market.slug]);
    return ok(undefined, isActive ? "Đã hiển thị thị trường" : "Đã ẩn thị trường");
  });
}

export async function toggleMarketFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [market] = await db.update(markets).set({ isFeatured }).where(eq(markets.id, id)).returning({ slug: markets.slug });
    if (!market) return fail("Không tìm thấy thị trường");
    revalidateMarketPages([market.slug]);
    return ok(undefined, isFeatured ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
  });
}
