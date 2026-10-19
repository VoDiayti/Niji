"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
    const found = await prisma.market.findUnique({ where: { slug }, select: { id: true } });
    return !!found && found.id !== excludeId;
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

/** Chuyển giá trị form (chuỗi) sang dữ liệu Prisma */
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
    const market = await prisma.market.create({ data: { ...toData(parsed.data), slug } });
    revalidateMarketPages([slug]);
    return ok({ id: market.id }, "Đã tạo thị trường");
  });
}

export async function updateMarket(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = marketSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const existing = await prisma.market.findUnique({ where: { id }, select: { slug: true } });
    if (!existing) return fail("Không tìm thấy thị trường");

    const slug = await resolveSlug(parsed.data.slug, parsed.data.name, id);
    await prisma.market.update({ where: { id }, data: { ...toData(parsed.data), slug } });
    revalidateMarketPages([existing.slug, slug]);
    revalidatePath(`${ADMIN_PATH}/${id}`);
    return ok({ id }, "Đã lưu thị trường");
  });
}

export async function deleteMarket(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const market = await prisma.market.findUnique({ where: { id }, select: { slug: true, _count: { select: { jobOrders: true } } } });
    if (!market) return fail("Không tìm thấy thị trường");
    if (market._count.jobOrders > 0) {
      return fail(`Thị trường đang có ${market._count.jobOrders} đơn hàng, hãy xóa hoặc chuyển đơn hàng trước`);
    }
    await prisma.market.delete({ where: { id } });
    revalidateMarketPages([market.slug]);
    return ok(undefined, "Đã xóa thị trường");
  });
}

export async function toggleMarketActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const market = await prisma.market.update({ where: { id }, data: { isActive }, select: { slug: true } });
    revalidateMarketPages([market.slug]);
    return ok(undefined, isActive ? "Đã hiển thị thị trường" : "Đã ẩn thị trường");
  });
}

export async function toggleMarketFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const market = await prisma.market.update({ where: { id }, data: { isFeatured }, select: { slug: true } });
    revalidateMarketPages([market.slug]);
    return ok(undefined, isFeatured ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
  });
}
