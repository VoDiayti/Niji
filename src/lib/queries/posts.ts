import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { PAGE_SIZE } from "@/lib/constants";
import { slugify } from "@/lib/slug";

/** Quy tắc hiển thị bài viết công khai: đã xuất bản hoặc hẹn giờ và đã tới giờ đăng */
export function publicPostWhere(now = new Date()): Prisma.PostWhereInput {
  return { status: { in: ["PUBLISHED", "SCHEDULED"] }, publishedAt: { lte: now } };
}

export const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  isFeatured: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.PostSelect;

export type PostCardData = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;

export type PostDetail = Prisma.PostGetPayload<{
  include: { category: true; tags: true; author: { select: { name: true } } };
}>;

const postOrder: Prisma.PostOrderByWithRelationInput[] = [{ publishedAt: "desc" }, { createdAt: "desc" }];

/** Bài viết mới nhất */
export async function getLatestPosts(limit = 4) {
  return prisma.post.findMany({ where: publicPostWhere(), select: postCardSelect, orderBy: postOrder, take: limit });
}

/** Bài nổi bật (sidebar); nếu chưa đủ thì bù bằng bài mới */
export async function getFeaturedPosts(limit = 4) {
  const featured = await prisma.post.findMany({
    where: { ...publicPostWhere(), isFeatured: true },
    select: postCardSelect,
    orderBy: postOrder,
    take: limit,
  });
  if (featured.length >= limit) return featured;
  const more = await prisma.post.findMany({
    where: { ...publicPostWhere(), id: { notIn: featured.map((p) => p.id) } },
    select: postCardSelect,
    orderBy: postOrder,
    take: limit - featured.length,
  });
  return [...featured, ...more];
}

export type PostSearch = { q?: string; categorySlug?: string; tagSlug?: string; page?: number };

/** Danh sách bài viết có tìm kiếm, lọc chuyên mục/thẻ và phân trang */
export async function searchPosts(params: PostSearch) {
  const and: Prisma.PostWhereInput[] = [publicPostWhere()];
  if (params.categorySlug) and.push({ category: { slug: params.categorySlug } });
  if (params.tagSlug) and.push({ tags: { some: { slug: params.tagSlug } } });

  const q = params.q?.trim();
  if (q) {
    const or: Prisma.PostWhereInput[] = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
    ];
    const s = slugify(q);
    if (s) or.push({ slug: { contains: s } });
    and.push({ OR: or });
  }

  const where: Prisma.PostWhereInput = { AND: and };
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({ where, select: postCardSelect, orderBy: postOrder, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.post.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Chi tiết bài viết; trả null nếu không tồn tại hoặc chưa tới giờ đăng */
export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  return prisma.post.findFirst({
    where: { slug, ...publicPostWhere() },
    include: { category: true, tags: true, author: { select: { name: true } } },
  });
}

/** Bài liên quan: cùng chuyên mục, không tính bài hiện tại; thiếu thì bù bài mới */
export async function getRelatedPosts(post: { id: string; categoryId: string | null }, limit = 3) {
  const related = post.categoryId
    ? await prisma.post.findMany({
        where: { ...publicPostWhere(), categoryId: post.categoryId, id: { not: post.id } },
        select: postCardSelect,
        orderBy: postOrder,
        take: limit,
      })
    : [];
  if (related.length >= limit) return related;
  const more = await prisma.post.findMany({
    where: { ...publicPostWhere(), id: { notIn: [post.id, ...related.map((p) => p.id)] } },
    select: postCardSelect,
    orderBy: postOrder,
    take: limit - related.length,
  });
  return [...related, ...more];
}

/** Chuyên mục đang hoạt động kèm số bài công khai */
export const getActiveCategories = cache(async () =>
  prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { posts: { where: publicPostWhere() } } },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })
);

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, isActive: true } });
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

/** Dùng cho sitemap */
export async function getPostSlugs() {
  return prisma.post.findMany({ where: publicPostWhere(), select: { slug: true, updatedAt: true, publishedAt: true }, orderBy: postOrder });
}
