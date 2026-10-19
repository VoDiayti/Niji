"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { settingsSchema, type SettingsFormValues } from "@/lib/validations/settings";

const toInt = (v: string | undefined): number | null => (v && v.trim() ? Number(v.replace(/[.,\s]/g, "")) : null);
/** HTML chỉ có đoạn trống (<p></p>) → null */
function htmlOrNull(html: string | undefined): string | null {
  if (!html) return null;
  const empty = /^(\s*<p[^>]*>(\s|<br\s*\/?>|&nbsp;)*<\/p>\s*)*$/i.test(html);
  return empty ? null : html;
}

/** Chuyển giá trị form (chuỗi) sang dữ liệu Prisma */
function toData(v: SettingsFormValues) {
  return {
    companyName: v.companyName,
    shortName: v.shortName || null,
    slogan: v.slogan || null,
    logo: v.logo || null,
    licenseNumber: v.licenseNumber || null,
    licenseIssuer: v.licenseIssuer || null,
    taxCode: v.taxCode || null,
    foundedYear: toInt(v.foundedYear),
    hotline: v.hotline,
    zalo: v.zalo || null,
    email: v.email || null,
    address: v.address || null,
    mapEmbedUrl: v.mapEmbedUrl || null,
    workingHours: v.workingHours || null,
    facebook: v.facebook || null,
    youtube: v.youtube || null,
    tiktok: v.tiktok || null,
    messenger: v.messenger || null,
    statWorkers: toInt(v.statWorkers),
    statYears: toInt(v.statYears),
    statPartners: toInt(v.statPartners),
    statMarkets: toInt(v.statMarkets),
    aboutShort: v.aboutShort || null,
    aboutContent: htmlOrNull(v.aboutContent),
    vision: v.vision || null,
    mission: v.mission || null,
    metaTitle: v.metaTitle || null,
    metaDescription: v.metaDescription || null,
    ogImage: v.ogImage || null,
  };
}

/** Lưu cài đặt chung (1 dòng, id = 1). Cả Quản trị viên và Biên tập viên đều được sửa. */
export async function updateSettings(input: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const data = toData(parsed.data);
    await prisma.setting.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });

    // Cài đặt dùng ở header/footer/metadata của mọi trang → làm mới toàn bộ site
    revalidatePath("/", "layout");
    revalidatePath("/admin/cai-dat");
    return ok(undefined, "Đã lưu cài đặt chung");
  });
}
