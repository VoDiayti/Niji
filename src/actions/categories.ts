"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { categorySchema } from "@/lib/validations/category";

async function categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await prisma.category.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return found !== null;
}

function revalidateCategoryPaths(slugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/tin-tuc");
  revalidatePath("/sitemap.xml");
  for (const s of new Set(slugs.filter((v): v is string => !!v))) revalidatePath(`/tin-tuc/chuyen-muc/${s}`);
  revalidatePath("/admin/chuyen-muc");
  revalidatePath("/admin/bai-viet");
}

export async function createCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const slug = await uniqueSlug(slugify(d.slug || d.name) || "chuyen-muc", (s) => categorySlugExists(s));
    const category = await prisma.category.create({
      data: { name: d.name, slug, description: d.description || null, order: Number(d.order) || 0, isActive: d.isActive },
    });
    revalidateCategoryPaths([category.slug]);
    return ok({ id: category.id }, "Đã tạo chuyên mục");
  });
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const current = await prisma.category.findUnique({ where: { id }, select: { slug: true } });
    if (!current) return fail("Chuyên mục không tồn tại hoặc đã bị xóa.");
    const slug = await uniqueSlug(slugify(d.slug || d.name) || "chuyen-muc", (s) => categorySlugExists(s, id));
    const category = await prisma.category.update({
      where: { id },
      data: { name: d.name, slug, description: d.description || null, order: Number(d.order) || 0, isActive: d.isActive },
    });
    revalidateCategoryPaths([current.slug, category.slug]);
    // Bài viết thuộc chuyên mục cũng cần làm mới (tên chuyên mục hiển thị trong bài)
    const posts = await prisma.post.findMany({ where: { categoryId: id }, select: { slug: true } });
    for (const p of posts) revalidatePath(`/tin-tuc/${p.slug}`);
    return ok({ id: category.id }, "Đã lưu chuyên mục");
  });
}

/** Xóa chuyên mục – bài viết thuộc chuyên mục sẽ về "chưa phân loại" (onDelete: SetNull) */
export async function deleteCategory(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const category = await prisma.category.findUnique({ where: { id }, select: { slug: true, posts: { select: { slug: true } } } });
    if (!category) return fail("Chuyên mục không tồn tại hoặc đã bị xóa.");
    await prisma.category.delete({ where: { id } });
    revalidateCategoryPaths([category.slug]);
    for (const p of category.posts) revalidatePath(`/tin-tuc/${p.slug}`);
    return ok(undefined, "Đã xóa chuyên mục");
  });
}
