"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { banners, db } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { bannerSchema, type BannerFormValues } from "@/lib/validations/banner";

const ADMIN_PATH = "/admin/banner";

function revalidateBannerPages() {
  revalidatePath("/");
  revalidatePath(ADMIN_PATH);
}

function toData(v: BannerFormValues) {
  return {
    title: v.title,
    subtitle: v.subtitle || null,
    image: v.image,
    ctaText: v.ctaText || null,
    ctaLink: v.ctaLink || null,
    ctaText2: v.ctaText2 || null,
    ctaLink2: v.ctaLink2 || null,
    order: v.order ? Number(v.order) : 0,
    isActive: v.isActive,
  };
}

export async function createBanner(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = bannerSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const [banner] = await db.insert(banners).values(toData(parsed.data)).returning({ id: banners.id });
    revalidateBannerPages();
    return ok({ id: banner.id }, "Đã thêm banner");
  });
}

export async function updateBanner(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = bannerSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const existing = await db.query.banners.findFirst({ columns: { id: true }, where: eq(banners.id, id) });
    if (!existing) return fail("Không tìm thấy banner");
    await db.update(banners).set(toData(parsed.data)).where(eq(banners.id, id));
    revalidateBannerPages();
    return ok({ id }, "Đã lưu banner");
  });
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const existing = await db.query.banners.findFirst({ columns: { id: true }, where: eq(banners.id, id) });
    if (!existing) return fail("Không tìm thấy banner");
    await db.delete(banners).where(eq(banners.id, id));
    revalidateBannerPages();
    return ok(undefined, "Đã xóa banner");
  });
}

export async function toggleBannerActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [row] = await db.update(banners).set({ isActive }).where(eq(banners.id, id)).returning({ id: banners.id });
    if (!row) return fail("Không tìm thấy banner");
    revalidateBannerPages();
    return ok(undefined, isActive ? "Đã hiển thị banner" : "Đã ẩn banner");
  });
}
