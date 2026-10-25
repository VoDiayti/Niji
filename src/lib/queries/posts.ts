import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq, inArray, like, lte, ne, notInArray, or, type SQL } from "drizzle-orm";
import { categories, db, posts, postTags, tags } from "@/db";
import type { Category, Post, Tag } from "@/db/types";
import { PAGE_SIZE } from "@/lib/constants";
import { slugify } from "@/lib/slug";

/** Quy tắc hiển thị bài viết công khai: đã xuất bản hoặc hẹn giờ và đã tới giờ đăng */
export function publicPostWhere(now = new Date()): SQL | undefined {
  return and(inArray(posts.status, ["PUBLISHED", "SCHEDULED"]), lte(posts.publishedAt, now));
}

/** Các trường cần cho card bài viết */
export const postCardColumns = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  isFeatured: true,
} as const;

const postCardWith = { category: { columns: { name: true, slug: true } } } as const;

export type PostCardData = Pick<Post, keyof typeof postCardColumns> & {
  category: Pick<Category, "name" | "slug"> | null;
};

/** Chi tiết bài viết kèm chuyên mục, thẻ và tên tác giả */
export type PostDetail = Post & {
  category: Category | null;
  author: { name: string } | null;
  tags: Tag[];
};

const postOrder = [desc(posts.publishedAt), desc(posts.createdAt)];

/** Bài viết mới nhất */
export async function getLatestPosts(limit = 4): Promise<PostCardData[]> {
  return db.query.posts.findMany({ where: publicPostWhere(), columns: postCardColumns, with: postCardWith, orderBy: postOrder, limit });
}

/** Bài nổi bật (sidebar); nếu chưa đủ thì bù bằng bài mới */
export async function getFeaturedPosts(limit = 4): Promise<PostCardData[]> {
  const featured = await db.query.posts.findMany({
    where: and(publicPostWhere(), eq(posts.isFeatured, true)),
    columns: postCardColumns,
    with: postCardWith,
    orderBy: postOrder,
    limit,
  });
  if (featured.length >= limit) return featured;
  const more = await db.query.posts.findMany({
    where: and(publicPostWhere(), notInArray(posts.id, featured.map((p) => p.id))),
    columns: postCardColumns,
    with: postCardWith,
    orderBy: postOrder,
    limit: limit - featured.length,
  });
  return [...featured, ...more];
}

export type PostSearch = { q?: string; categorySlug?: string; tagSlug?: string; page?: number };

/** Danh sách bài viết có tìm kiếm, lọc chuyên mục/thẻ và phân trang */
export async function searchPosts(params: PostSearch) {
  const conditions: (SQL | undefined)[] = [publicPostWhere()];

  if (params.categorySlug) {
    conditions.push(inArray(posts.categoryId, db.select({ id: categories.id }).from(categories).where(eq(categories.slug, params.categorySlug))));
  }
  if (params.tagSlug) {
    conditions.push(
      inArray(
        posts.id,
        db.select({ postId: postTags.postId }).from(postTags).innerJoin(tags, eq(tags.id, postTags.tagId)).where(eq(tags.slug, params.tagSlug))
      )
    );
  }

  const q = params.q?.trim();
  if (q) {
    const pattern = `%${q}%`;
    const terms: (SQL | undefined)[] = [like(posts.title, pattern), like(posts.excerpt, pattern)];
    const s = slugify(q);
    if (s) terms.push(like(posts.slug, `%${s}%`));
    conditions.push(or(...terms));
  }

  const where = and(...conditions);
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const [items, [{ total }]] = await Promise.all([
    db.query.posts.findMany({
      where,
      columns: postCardColumns,
      with: postCardWith,
      orderBy: postOrder,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    db.select({ total: count() }).from(posts).where(where),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Chi tiết bài viết; trả null nếu không tồn tại hoặc chưa tới giờ đăng */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), publicPostWhere()),
    with: { category: true, author: { columns: { name: true } }, postTags: { with: { tag: true } } },
  });
  if (!post) return null;
  const { postTags: links, ...rest } = post;
  return { ...rest, tags: links.map((pt) => pt.tag) };
}

/** Bài liên quan: cùng chuyên mục, không tính bài hiện tại; thiếu thì bù bài mới */
export async function getRelatedPosts(post: { id: string; categoryId: string | null }, limit = 3): Promise<PostCardData[]> {
  const related = post.categoryId
    ? await db.query.posts.findMany({
        where: and(publicPostWhere(), eq(posts.categoryId, post.categoryId), ne(posts.id, post.id)),
        columns: postCardColumns,
        with: postCardWith,
        orderBy: postOrder,
        limit,
      })
    : [];
  if (related.length >= limit) return related;
  const more = await db.query.posts.findMany({
    where: and(publicPostWhere(), notInArray(posts.id, [post.id, ...related.map((p) => p.id)])),
    columns: postCardColumns,
    with: postCardWith,
    orderBy: postOrder,
    limit: limit - related.length,
  });
  return [...related, ...more];
}

/** Chuyên mục đang hoạt động kèm số bài công khai (`postCount`) */
export const getActiveCategories = cache(async () =>
  db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      postCount: count(posts.id),
    })
    .from(categories)
    .leftJoin(posts, and(eq(posts.categoryId, categories.id), publicPostWhere()))
    .where(eq(categories.isActive, true))
    .groupBy(categories.id)
    .orderBy(asc(categories.order), asc(categories.name))
);

export async function getCategoryBySlug(slug: string) {
  return db.query.categories.findFirst({ where: and(eq(categories.slug, slug), eq(categories.isActive, true)) });
}

export async function getTagBySlug(slug: string) {
  return db.query.tags.findFirst({ where: eq(tags.slug, slug) });
}

/** Dùng cho sitemap */
export async function getPostSlugs() {
  return db.query.posts.findMany({ where: publicPostWhere(), columns: { slug: true, updatedAt: true, publishedAt: true }, orderBy: postOrder });
}
