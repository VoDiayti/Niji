import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ExternalLink, Eye, Pencil, Tag, User } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, posts } from "@/db";
import { formatDateTime } from "@/lib/format";
import { PostStatusBadge } from "@/components/admin/status-badge";
import { RichContent } from "@/components/shared/rich-content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Xem trước bài viết" };

/** Bản xem trước bài viết – hiển thị như trang công khai, kèm dải thông báo trạng thái */
export default async function PostPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      category: { columns: { name: true, slug: true } },
      postTags: { with: { tag: { columns: { id: true, name: true, slug: true } } } },
      author: { columns: { name: true } },
    },
  });
  if (!post) notFound();
  const tagList = post.postTags.map((pt) => pt.tag);

  const isLive = (post.status === "PUBLISHED" || post.status === "SCHEDULED") && !!post.publishedAt && post.publishedAt <= new Date();
  const statusNote = isLive
    ? "đã xuất bản, đang hiển thị trên website"
    : post.status === "SCHEDULED"
      ? `hẹn giờ đăng lúc ${formatDateTime(post.publishedAt)}`
      : "chưa xuất bản";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="flex flex-wrap items-center gap-2">
          <Eye className="size-4 shrink-0" />
          <span><strong>Bản xem trước</strong> – {statusNote}</span>
          <PostStatusBadge status={post.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild className="bg-background">
            <Link href={`/admin/bai-viet/${post.id}`}><Pencil /> Quay lại chỉnh sửa</Link>
          </Button>
          {isLive && (
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/tin-tuc/${post.slug}`} target="_blank"><ExternalLink /> Xem trên website</Link>
            </Button>
          )}
        </div>
      </div>

      <article className="rounded-xl border bg-background p-5 sm:p-8 lg:p-10">
        {post.category && <Badge variant="secondary">{post.category.name}</Badge>}
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-4" /> {formatDateTime(post.publishedAt ?? post.updatedAt)}
          </span>
          {post.author?.name && (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4" /> {post.author.name}
            </span>
          )}
        </div>
        {post.excerpt && <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element -- URL ảnh bất kỳ trong admin
          <img src={post.coverImage} alt={post.title} className="mt-6 aspect-video w-full rounded-xl object-cover" />
        )}

        <RichContent html={post.content} className="mt-8" />

        {tagList.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-6">
            <Tag className="size-4 text-muted-foreground" />
            {tagList.map((t) => (
              <Badge key={t.id} variant="outline">{t.name}</Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
