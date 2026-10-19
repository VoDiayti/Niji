import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Tag, UserRound } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getActiveCategories, getFeaturedPosts, getPostBySlug, getRelatedPosts } from "@/lib/queries/posts";
import { absoluteUrl, articleJsonLd, buildMetadata, plainText } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { ShareButtons } from "@/components/public/share-buttons";
import { NewsSidebar } from "@/components/public/news-sidebar";
import { PostCard } from "@/components/public/post-card";
import { SectionHeading } from "@/components/public/section-heading";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, post] = await Promise.all([getSettings(), getPostBySlug(slug)]);
  if (!post) return { title: "Không tìm thấy bài viết" };
  return buildMetadata(s, {
    title: post.metaTitle || post.title,
    absoluteTitle: Boolean(post.metaTitle),
    description: post.metaDescription || post.excerpt || plainText(post.content, 200),
    path: `/tin-tuc/${post.slug}`,
    image: post.ogImage || post.coverImage,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: post.author?.name ? [post.author.name] : undefined,
  });
}

function readingMinutes(html: string) {
  const words = plainText(html, 100_000).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const [s, post] = await Promise.all([getSettings(), getPostBySlug(slug)]);
  if (!post) notFound();
  const [related, categories, featured] = await Promise.all([getRelatedPosts(post, 3), getActiveCategories(), getFeaturedPosts(4)]);
  const url = absoluteUrl(`/tin-tuc/${post.slug}`);

  return (
    <>
      <JsonLd data={articleJsonLd(s, post)} />

      <div className="border-b bg-muted/60">
        <div className="container-page py-4">
          <Breadcrumbs
            items={[
              { label: "Tin tức", href: "/tin-tuc" },
              ...(post.category ? [{ label: post.category.name, href: `/tin-tuc/chuyen-muc/${post.category.slug}` }] : []),
              { label: post.title },
            ]}
          />
        </div>
      </div>

      <section className="bg-background py-8 md:py-12">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <article className="min-w-0 lg:col-span-2">
            <header>
              {post.category && (
                <Badge asChild className="bg-brand-light text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link href={`/tin-tuc/chuyen-muc/${post.category.slug}`}>{post.category.name}</Link>
                </Badge>
              )}
              <h1 className="mt-3 text-2xl font-bold leading-tight text-brand-dark md:text-4xl">{post.title}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt.toISOString()} className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" /> {formatDate(post.publishedAt)}
                  </time>
                )}
                {post.author?.name && (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-4" /> {post.author.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {readingMinutes(post.content)} phút đọc
                </span>
              </div>
              {post.excerpt && <p className="mt-5 border-l-4 border-cta pl-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>}
            </header>

            {post.coverImage && (
              <figure className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-md">
                <Image src={post.coverImage} alt={post.title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
              </figure>
            )}

            <div className="mt-8">
              <RichContent html={post.content} className="prose-lg prose-h2:text-brand-dark prose-h3:text-brand-dark" />
            </div>

            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Tag className="size-4 text-muted-foreground" />
                {post.tags.map((t) => (
                  <Link key={t.id} href={`/tin-tuc/the/${t.slug}`} className="rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary">
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6 border-t pt-6">
              <ShareButtons url={url} title={post.title} />
            </div>
          </article>

          <NewsSidebar categories={categories} featured={featured} activeCategorySlug={post.category?.slug} hotline={s.hotline} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-muted py-14 md:py-20">
          <div className="container-page">
            <SectionHeading label="Bài viết liên quan" title="Có thể bạn quan tâm" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
