"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { count, desc, eq, like, or } from "drizzle-orm";
import { db, media } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { deleteMedia } from "@/lib/upload";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { MEDIA_PAGE_SIZE, toMediaItem, type MediaItem } from "@/components/admin/media/media-types";

const searchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.number().int().min(1).max(10_000).optional(),
});

export type MediaSearchResult = { items: MediaItem[]; total: number; page: number; pageSize: number };

/** Tìm ảnh trong thư viện (dùng cho hộp thoại chọn ảnh) – mới nhất trước */
export async function searchMedia(input: unknown): Promise<ActionResult<MediaSearchResult>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = searchSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const q = parsed.data.q ?? "";
    const page = parsed.data.page ?? 1;
    const where = q ? or(like(media.filename, `%${q}%`), like(media.alt, `%${q}%`)) : undefined;
    const [rows, [{ total }]] = await Promise.all([
      db.query.media.findMany({
        where,
        orderBy: [desc(media.createdAt)],
        limit: MEDIA_PAGE_SIZE,
        offset: (page - 1) * MEDIA_PAGE_SIZE,
        with: { uploadedBy: { columns: { name: true } } },
      }),
      db.select({ total: count() }).from(media).where(where),
    ]);
    return ok({ items: rows.map(toMediaItem), total, page, pageSize: MEDIA_PAGE_SIZE });
  });
}

const altSchema = z.string().trim().max(300, "Mô tả ảnh tối đa 300 ký tự");

export async function updateMediaAlt(id: string, alt: string): Promise<ActionResult<{ alt: string | null }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = altSchema.safeParse(alt);
    if (!parsed.success) return zodFail(parsed.error);
    const exists = await db.query.media.findFirst({ columns: { id: true }, where: eq(media.id, id) });
    if (!exists) return fail("Ảnh không tồn tại hoặc đã bị xóa.");
    const [row] = await db.update(media).set({ alt: parsed.data || null }).where(eq(media.id, id)).returning({ alt: media.alt });
    revalidatePath("/admin/thu-vien-anh");
    return ok({ alt: row.alt }, "Đã lưu mô tả ảnh");
  });
}

/** Xóa ảnh khỏi storage và database */
export async function deleteMediaAction(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const exists = await db.query.media.findFirst({ columns: { id: true }, where: eq(media.id, id) });
    if (!exists) return fail("Ảnh không tồn tại hoặc đã bị xóa.");
    await deleteMedia(id);
    revalidatePath("/admin/thu-vien-anh");
    return ok(undefined, "Đã xóa ảnh");
  });
}
