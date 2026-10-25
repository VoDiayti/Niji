import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { categories, db, posts, tags } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { PostStatusBadge } from "@/components/admin/status-badge";
import { PostForm, type PostFormInitialData } from "@/components/admin/posts/post-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Chỉnh sửa bài viết" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categoryOptions, tagOptions] = await Promise.all([
    db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: { postTags: { columns: { tagId: true } }, author: { columns: { name: true } } },
    }),
    db.query.categories.findMany({ columns: { id: true, name: true }, orderBy: [asc(categories.order), asc(categories.name)] }),
    db.query.tags.findMany({ columns: { id: true, name: true }, orderBy: [asc(tags.name)] }),
  ]);
  if (!post) notFound();

  const initialData: PostFormInitialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    isFeatured: post.isFeatured,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    ogImage: post.ogImage,
    categoryId: post.categoryId,
    tagIds: post.postTags.map((pt) => pt.tagId),
    authorName: post.author?.name ?? null,
    updatedAt: post.updatedAt.toISOString(),
  };

  return (
    <>
      <PageHeader
        title="Chỉnh sửa bài viết"
        description={post.title}
        actions={
          <>
            <PostStatusBadge status={post.status} />
            <Button variant="outline" asChild>
              <Link href="/admin/bai-viet"><ArrowLeft /> Danh sách bài viết</Link>
            </Button>
          </>
        }
      />
      <PostForm initialData={initialData} categories={categoryOptions} tags={tagOptions} />
    </>
  );
}
