import Link from "next/link";
import { getSettings } from "@/lib/queries/settings";
import { getActiveCategories, getFeaturedPosts, searchPosts } from "@/lib/queries/posts";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import type { Crumb } from "@/components/public/breadcrumbs";
import { PostCard } from "@/components/public/post-card";
import { NewsSidebar } from "@/components/public/news-sidebar";
import { PublicPagination } from "@/components/public/public-pagination";
import { PublicEmptyState } from "@/components/public/empty-state";

type NewsListingProps = {
  title: string;
  description?: string | null;
  crumbs: Crumb[];
  /** Đường dẫn gốc của trang (để phân trang) */
  pathname: string;
  q?: string;
  page: number;
  categorySlug?: string;
  tagSlug?: string;
};

/** Khối danh sách tin tức dùng chung cho /tin-tuc, chuyên mục và thẻ */
export async function NewsListing({ title, description, crumbs, pathname, q, page, categorySlug, tagSlug }: NewsListingProps) {
  const [s, result, categories, featured] = await Promise.all([
    getSettings(),
    searchPosts({ q, page, categorySlug, tagSlug }),
    getActiveCategories(),
    getFeaturedPosts(4),
  ]);

  return (
    <>
      <PageHero title={title} description={description} crumbs={crumbs} />
      <section className="bg-muted py-10 md:py-14">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {q ? (
                  <>
                    Kết quả tìm kiếm cho “<strong className="text-foreground">{q}</strong>”: <strong className="text-foreground">{result.total}</strong> bài viết
                  </>
                ) : (
                  <>
                    <strong className="text-foreground">{result.total}</strong> bài viết
                  </>
                )}
                {result.totalPages > 1 && <> – trang {result.page}/{result.totalPages}</>}
              </p>
              {q && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={pathname}>Xóa tìm kiếm</Link>
                </Button>
              )}
            </div>

            {result.items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {result.items.map((p, i) => (
                  <PostCard key={p.id} post={p} priority={i < 2} />
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title={q ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết"}
                description={q ? "Hãy thử từ khóa khác hoặc xem tất cả bài viết." : "Nội dung đang được cập nhật, vui lòng quay lại sau."}
                action={
                  <Button asChild variant="outline" className="h-11">
                    <Link href="/tin-tuc">Xem tất cả bài viết</Link>
                  </Button>
                }
              />
            )}

            <PublicPagination page={result.page} totalPages={result.totalPages} pathname={pathname} query={{ q }} />
          </div>

          <NewsSidebar categories={categories} featured={featured} activeCategorySlug={categorySlug} query={q} hotline={s.hotline} />
        </div>
      </section>
    </>
  );
}
