"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq, inArray, ne } from "drizzle-orm";
import { categories, db, posts, postTags, tags } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { NONE_VALUE, postSchema } from "@/lib/validations/post";
import type { PostStatus } from "@/db/enums";

export type PostMutationData = { id: string; slug: string; tagIds: string[] };

type TagRef = { id: string; slug: string };

async function postSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await db.query.posts.findFirst({
    columns: { id: true },
    where: and(eq(posts.slug, slug), excludeId ? ne(posts.id, excludeId) : undefined),
  });
  return found !== undefined;
}

/** Kiểm tra chuyên mục được chọn; trả về null khi "chưa phân loại", undefined khi không tồn tại */
async function resolveCategory(value: string): Promise<{ id: string; slug: string } | null | undefined> {
  if (!value || value === NONE_VALUE) return null;
  const category = await db.query.categories.findFirst({ columns: { id: true, slug: true }, where: eq(categories.id, value) });
  return category ?? undefined;
}

/** Gom thẻ đã chọn + tạo thẻ mới theo tên (tìm theo slug, chưa có thì thêm) */
async function resolveTags(tagIds: string[], newTags: string): Promise<TagRef[]> {
  const existing = tagIds.length > 0 ? await db.query.tags.findMany({ columns: { id: true, slug: true }, where: inArray(tags.id, tagIds) }) : [];
  const byId = new Map<string, TagRef>(existing.map((t) => [t.id, t]));
  const names = newTags.split(",").map((s) => s.trim()).filter(Boolean);
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    const found = await db.query.tags.findFirst({ columns: { id: true, slug: true }, where: eq(tags.slug, slug) });
    if (found) {
      byId.set(found.id, found);
      continue;
    }
    const [created] = await db.insert(tags).values({ name: name.slice(0, 50), slug }).returning({ id: tags.id, slug: tags.slug });
    byId.set(created.id, created);
  }
  return [...byId.values()];
}

/** PUBLISHED mà trống → now; SCHEDULED đã được schema kiểm tra ở tương lai; DRAFT giữ nguyên nếu có */
function resolvePublishedAt(status: PostStatus, value: string): Date | null {
  const date = value ? new Date(value) : null;
  const valid = date && !Number.isNaN(date.getTime()) ? date : null;
  if (status === "PUBLISHED") return valid ?? new Date();
  return valid;
}

function revalidatePostPaths(opts: { slugs: (string | null | undefined)[]; categorySlugs: (string | null | undefined)[]; tagSlugs?: string[] }) {
  revalidatePath("/");
  revalidatePath("/tin-tuc");
  revalidatePath("/sitemap.xml");
  for (const s of new Set(opts.slugs.filter((v): v is string => !!v))) revalidatePath(`/tin-tuc/${s}`);
  for (const s of new Set(opts.categorySlugs.filter((v): v is string => !!v))) revalidatePath(`/tin-tuc/chuyen-muc/${s}`);
  for (const s of new Set(opts.tagSlugs ?? [])) revalidatePath(`/tin-tuc/the/${s}`);
  revalidatePath("/admin/bai-viet");
  revalidatePath("/admin");
}

export async function createPost(input: unknown): Promise<ActionResult<PostMutationData>> {
  return safeAction(async () => {
    const user = await assertUser();
    const parsed = postSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;

    const category = await resolveCategory(d.categoryId);
    if (category === undefined) return fail("Chuyên mục không tồn tại.", { categoryId: ["Chuyên mục không tồn tại"] });

    const slug = await uniqueSlug(d.slug || d.title, (s) => postSlugExists(s));
    const tagList = await resolveTags(d.tagIds, d.newTags);

    const [post] = await db
      .insert(posts)
      .values({
        title: d.title,
        slug,
        excerpt: d.excerpt || null,
        content: d.content,
        coverImage: d.coverImage || null,
        status: d.status,
        publishedAt: resolvePublishedAt(d.status, d.publishedAt),
        isFeatured: d.isFeatured,
        metaTitle: d.metaTitle || null,
        metaDescription: d.metaDescription || null,
        ogImage: d.ogImage || null,
        categoryId: category?.id ?? null,
        authorId: user.id,
      })
      .returning({ id: posts.id, slug: posts.slug });
    if (tagList.length > 0) {
      await db.insert(postTags).values(tagList.map((t) => ({ postId: post.id, tagId: t.id })));
    }

    revalidatePostPaths({ slugs: [post.slug], categorySlugs: [category?.slug], tagSlugs: tagList.map((t) => t.slug) });
    return ok({ id: post.id, slug: post.slug, tagIds: tagList.map((t) => t.id) }, "Đã tạo bài viết");
  });
}

export async function updatePost(id: string, input: unknown): Promise<ActionResult<PostMutationData>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = postSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;

    const current = await db.query.posts.findFirst({
      columns: { slug: true },
      where: eq(posts.id, id),
      with: { category: { columns: { slug: true } }, postTags: { with: { tag: { columns: { slug: true } } } } },
    });
    if (!current) return fail("Bài viết không tồn tại hoặc đã bị xóa.");

    const category = await resolveCategory(d.categoryId);
    if (category === undefined) return fail("Chuyên mục không tồn tại.", { categoryId: ["Chuyên mục không tồn tại"] });

    const slug = await uniqueSlug(d.slug || d.title, (s) => postSlugExists(s, id));
    const tagList = await resolveTags(d.tagIds, d.newTags);

    // Cập nhật bài + thay toàn bộ thẻ trong một batch nguyên tử (thay cho tags: { set })
    await db.batch([
      db
        .update(posts)
        .set({
          title: d.title,
          slug,
          excerpt: d.excerpt || null,
          content: d.content,
          coverImage: d.coverImage || null,
          status: d.status,
          publishedAt: resolvePublishedAt(d.status, d.publishedAt),
          isFeatured: d.isFeatured,
          metaTitle: d.metaTitle || null,
          metaDescription: d.metaDescription || null,
          ogImage: d.ogImage || null,
          categoryId: category?.id ?? null,
        })
        .where(eq(posts.id, id)),
      db.delete(postTags).where(eq(postTags.postId, id)),
      ...(tagList.length > 0 ? [db.insert(postTags).values(tagList.map((t) => ({ postId: id, tagId: t.id })))] : []),
    ]);

    revalidatePostPaths({
      slugs: [current.slug, slug],
      categorySlugs: [current.category?.slug, category?.slug],
      tagSlugs: [...current.postTags.map((pt) => pt.tag.slug), ...tagList.map((t) => t.slug)],
    });
    return ok({ id, slug, tagIds: tagList.map((t) => t.id) }, "Đã lưu bài viết");
  });
}

export async function deletePost(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const post = await db.query.posts.findFirst({
      columns: { slug: true },
      where: eq(posts.id, id),
      with: { category: { columns: { slug: true } }, postTags: { with: { tag: { columns: { slug: true } } } } },
    });
    if (!post) return fail("Bài viết không tồn tại hoặc đã bị xóa.");
    // Liên kết thẻ trong _PostToTag tự xóa theo FK ON DELETE CASCADE
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePostPaths({ slugs: [post.slug], categorySlugs: [post.category?.slug], tagSlugs: post.postTags.map((pt) => pt.tag.slug) });
    return ok(undefined, "Đã xóa bài viết");
  });
}

const toggleSchema = z.object({ id: z.string().min(1), isFeatured: z.boolean() });

export async function togglePostFeatured(id: string, isFeatured: boolean): Promise<ActionResult<{ isFeatured: boolean }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = toggleSchema.safeParse({ id, isFeatured });
    if (!parsed.success) return zodFail(parsed.error);
    const exists = await db.query.posts.findFirst({ columns: { id: true }, where: eq(posts.id, id), with: { category: { columns: { slug: true } } } });
    if (!exists) return fail("Bài viết không tồn tại hoặc đã bị xóa.");
    const [post] = await db
      .update(posts)
      .set({ isFeatured: parsed.data.isFeatured })
      .where(eq(posts.id, id))
      .returning({ slug: posts.slug, isFeatured: posts.isFeatured });
    revalidatePostPaths({ slugs: [post.slug], categorySlugs: [exists.category?.slug] });
    return ok({ isFeatured: post.isFeatured }, post.isFeatured ? "Đã đánh dấu nổi bật" : "Đã bỏ đánh dấu nổi bật");
  });
}
