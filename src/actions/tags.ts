"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify } from "@/lib/slug";
import { tagSchema } from "@/lib/validations/tag";

function revalidateTagPaths(slugs: (string | null | undefined)[]) {
  revalidatePath("/tin-tuc");
  revalidatePath("/sitemap.xml");
  for (const s of new Set(slugs.filter((v): v is string => !!v))) revalidatePath(`/tin-tuc/the/${s}`);
  revalidatePath("/admin/the");
  revalidatePath("/admin/bai-viet");
}

export async function createTag(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = tagSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const slug = slugify(d.slug || d.name);
    if (!slug) return fail("Không tạo được đường dẫn từ tên thẻ.", { slug: ["Vui lòng nhập đường dẫn hợp lệ"] });
    const existing = await prisma.tag.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return fail("Thẻ với đường dẫn này đã tồn tại.", { slug: ["Đường dẫn đã được dùng cho thẻ khác"] });
    const tag = await prisma.tag.create({ data: { name: d.name, slug } });
    revalidateTagPaths([tag.slug]);
    return ok({ id: tag.id }, "Đã tạo thẻ");
  });
}

export async function updateTag(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = tagSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const current = await prisma.tag.findUnique({ where: { id }, select: { slug: true } });
    if (!current) return fail("Thẻ không tồn tại hoặc đã bị xóa.");
    const slug = slugify(d.slug || d.name);
    if (!slug) return fail("Không tạo được đường dẫn từ tên thẻ.", { slug: ["Vui lòng nhập đường dẫn hợp lệ"] });
    const duplicate = await prisma.tag.findFirst({ where: { slug, id: { not: id } }, select: { id: true } });
    if (duplicate) return fail("Thẻ với đường dẫn này đã tồn tại.", { slug: ["Đường dẫn đã được dùng cho thẻ khác"] });
    const tag = await prisma.tag.update({ where: { id }, data: { name: d.name, slug } });
    revalidateTagPaths([current.slug, tag.slug]);
    const posts = await prisma.post.findMany({ where: { tags: { some: { id } } }, select: { slug: true } });
    for (const p of posts) revalidatePath(`/tin-tuc/${p.slug}`);
    return ok({ id: tag.id }, "Đã lưu thẻ");
  });
}

/** Xóa thẻ – liên kết với bài viết được gỡ tự động, bài viết không bị ảnh hưởng */
export async function deleteTag(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const tag = await prisma.tag.findUnique({ where: { id }, select: { slug: true, posts: { select: { slug: true } } } });
    if (!tag) return fail("Thẻ không tồn tại hoặc đã bị xóa.");
    await prisma.tag.delete({ where: { id } });
    revalidateTagPaths([tag.slug]);
    for (const p of tag.posts) revalidatePath(`/tin-tuc/${p.slug}`);
    return ok(undefined, "Đã xóa thẻ");
  });
}
