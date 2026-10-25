"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, posts, postTags, tags } from "@/db";
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
    const existing = await db.query.tags.findFirst({ columns: { id: true }, where: eq(tags.slug, slug) });
    if (existing) return fail("Thẻ với đường dẫn này đã tồn tại.", { slug: ["Đường dẫn đã được dùng cho thẻ khác"] });
    const [tag] = await db.insert(tags).values({ name: d.name, slug }).returning({ id: tags.id, slug: tags.slug });
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
    const current = await db.query.tags.findFirst({ columns: { slug: true }, where: eq(tags.id, id) });
    if (!current) return fail("Thẻ không tồn tại hoặc đã bị xóa.");
    const slug = slugify(d.slug || d.name);
    if (!slug) return fail("Không tạo được đường dẫn từ tên thẻ.", { slug: ["Vui lòng nhập đường dẫn hợp lệ"] });
    const duplicate = await db.query.tags.findFirst({ columns: { id: true }, where: and(eq(tags.slug, slug), ne(tags.id, id)) });
    if (duplicate) return fail("Thẻ với đường dẫn này đã tồn tại.", { slug: ["Đường dẫn đã được dùng cho thẻ khác"] });
    const [tag] = await db.update(tags).set({ name: d.name, slug }).where(eq(tags.id, id)).returning({ id: tags.id, slug: tags.slug });
    revalidateTagPaths([current.slug, tag.slug]);
    // Bài viết có gắn thẻ cũng cần làm mới (tên thẻ hiển thị trong bài)
    const related = await db
      .select({ slug: posts.slug })
      .from(posts)
      .innerJoin(postTags, eq(postTags.postId, posts.id))
      .where(eq(postTags.tagId, id));
    for (const p of related) revalidatePath(`/tin-tuc/${p.slug}`);
    return ok({ id: tag.id }, "Đã lưu thẻ");
  });
}

/** Xóa thẻ – liên kết với bài viết được gỡ tự động (FK ON DELETE CASCADE), bài viết không bị ảnh hưởng */
export async function deleteTag(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const tag = await db.query.tags.findFirst({
      columns: { slug: true },
      where: eq(tags.id, id),
      with: { postTags: { with: { post: { columns: { slug: true } } } } },
    });
    if (!tag) return fail("Thẻ không tồn tại hoặc đã bị xóa.");
    await db.delete(tags).where(eq(tags.id, id));
    revalidateTagPaths([tag.slug]);
    for (const pt of tag.postTags) revalidatePath(`/tin-tuc/${pt.post.slug}`);
    return ok(undefined, "Đã xóa thẻ");
  });
}
