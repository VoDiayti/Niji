"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { categories, db, posts } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { categorySchema } from "@/lib/validations/category";

async function categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await db.query.categories.findFirst({
    columns: { id: true },
    where: and(eq(categories.slug, slug), excludeId ? ne(categories.id, excludeId) : undefined),
  });
  return found !== undefined;
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
    const [category] = await db
      .insert(categories)
      .values({ name: d.name, slug, description: d.description || null, order: Number(d.order) || 0, isActive: d.isActive })
      .returning({ id: categories.id, slug: categories.slug });
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
    const current = await db.query.categories.findFirst({ columns: { slug: true }, where: eq(categories.id, id) });
    if (!current) return fail("Chuyên mục không tồn tại hoặc đã bị xóa.");
    const slug = await uniqueSlug(slugify(d.slug || d.name) || "chuyen-muc", (s) => categorySlugExists(s, id));
    const [category] = await db
      .update(categories)
      .set({ name: d.name, slug, description: d.description || null, order: Number(d.order) || 0, isActive: d.isActive })
      .where(eq(categories.id, id))
      .returning({ id: categories.id, slug: categories.slug });
    revalidateCategoryPaths([current.slug, category.slug]);
    // Bài viết thuộc chuyên mục cũng cần làm mới (tên chuyên mục hiển thị trong bài)
    const related = await db.query.posts.findMany({ columns: { slug: true }, where: eq(posts.categoryId, id) });
    for (const p of related) revalidatePath(`/tin-tuc/${p.slug}`);
    return ok({ id: category.id }, "Đã lưu chuyên mục");
  });
}

/** Xóa chuyên mục – bài viết thuộc chuyên mục sẽ về "chưa phân loại" (FK ON DELETE SET NULL) */
export async function deleteCategory(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const category = await db.query.categories.findFirst({
      columns: { slug: true },
      where: eq(categories.id, id),
      with: { posts: { columns: { slug: true } } },
    });
    if (!category) return fail("Chuyên mục không tồn tại hoặc đã bị xóa.");
    await db.delete(categories).where(eq(categories.id, id));
    revalidateCategoryPaths([category.slug]);
    for (const p of category.posts) revalidatePath(`/tin-tuc/${p.slug}`);
    return ok(undefined, "Đã xóa chuyên mục");
  });
}
