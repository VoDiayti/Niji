"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { NONE_VALUE, postSchema } from "@/lib/validations/post";
import type { PostStatus } from "@/generated/prisma/enums";

export type PostMutationData = { id: string; slug: string; tagIds: string[] };

async function postSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await prisma.post.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return found !== null;
}

/** Kiểm tra chuyên mục được chọn; trả về null khi "chưa phân loại", undefined khi không tồn tại */
async function resolveCategory(value: string): Promise<{ id: string; slug: string } | null | undefined> {
  if (!value || value === NONE_VALUE) return null;
  const category = await prisma.category.findUnique({ where: { id: value }, select: { id: true, slug: true } });
  return category ?? undefined;
}

/** Gom id thẻ đã chọn + tạo thẻ mới theo tên (nếu chưa có thẻ cùng slug) */
async function resolveTagIds(tagIds: string[], newTags: string): Promise<string[]> {
  const existing = tagIds.length > 0 ? await prisma.tag.findMany({ where: { id: { in: tagIds } }, select: { id: true } }) : [];
  const ids = new Set(existing.map((t) => t.id));
  const names = newTags.split(",").map((s) => s.trim()).filter(Boolean);
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({ where: { slug }, update: {}, create: { name: name.slice(0, 50), slug }, select: { id: true } });
    ids.add(tag.id);
  }
  return [...ids];
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
    const tagIds = await resolveTagIds(d.tagIds, d.newTags);

    const post = await prisma.post.create({
      data: {
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
        tags: { connect: tagIds.map((id) => ({ id })) },
      },
      select: { id: true, slug: true, tags: { select: { id: true, slug: true } } },
    });

    revalidatePostPaths({ slugs: [post.slug], categorySlugs: [category?.slug], tagSlugs: post.tags.map((t) => t.slug) });
    return ok({ id: post.id, slug: post.slug, tagIds: post.tags.map((t) => t.id) }, "Đã tạo bài viết");
  });
}

export async function updatePost(id: string, input: unknown): Promise<ActionResult<PostMutationData>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = postSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;

    const current = await prisma.post.findUnique({
      where: { id },
      select: { slug: true, category: { select: { slug: true } }, tags: { select: { slug: true } } },
    });
    if (!current) return fail("Bài viết không tồn tại hoặc đã bị xóa.");

    const category = await resolveCategory(d.categoryId);
    if (category === undefined) return fail("Chuyên mục không tồn tại.", { categoryId: ["Chuyên mục không tồn tại"] });

    const slug = await uniqueSlug(d.slug || d.title, (s) => postSlugExists(s, id));
    const tagIds = await resolveTagIds(d.tagIds, d.newTags);

    const post = await prisma.post.update({
      where: { id },
      data: {
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
        tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
      },
      select: { id: true, slug: true, tags: { select: { id: true, slug: true } } },
    });

    revalidatePostPaths({
      slugs: [current.slug, post.slug],
      categorySlugs: [current.category?.slug, category?.slug],
      tagSlugs: [...current.tags.map((t) => t.slug), ...post.tags.map((t) => t.slug)],
    });
    return ok({ id: post.id, slug: post.slug, tagIds: post.tags.map((t) => t.id) }, "Đã lưu bài viết");
  });
}

export async function deletePost(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const post = await prisma.post.findUnique({
      where: { id },
      select: { slug: true, category: { select: { slug: true } }, tags: { select: { slug: true } } },
    });
    if (!post) return fail("Bài viết không tồn tại hoặc đã bị xóa.");
    await prisma.post.delete({ where: { id } });
    revalidatePostPaths({ slugs: [post.slug], categorySlugs: [post.category?.slug], tagSlugs: post.tags.map((t) => t.slug) });
    return ok(undefined, "Đã xóa bài viết");
  });
}

const toggleSchema = z.object({ id: z.string().min(1), isFeatured: z.boolean() });

export async function togglePostFeatured(id: string, isFeatured: boolean): Promise<ActionResult<{ isFeatured: boolean }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = toggleSchema.safeParse({ id, isFeatured });
    if (!parsed.success) return zodFail(parsed.error);
    const exists = await prisma.post.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return fail("Bài viết không tồn tại hoặc đã bị xóa.");
    const post = await prisma.post.update({ where: { id }, data: { isFeatured: parsed.data.isFeatured }, select: { slug: true, isFeatured: true, category: { select: { slug: true } } } });
    revalidatePostPaths({ slugs: [post.slug], categorySlugs: [post.category?.slug] });
    return ok({ isFeatured: post.isFeatured }, post.isFeatured ? "Đã đánh dấu nổi bật" : "Đã bỏ đánh dấu nổi bật");
  });
}
