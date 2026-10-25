import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getSettings } from "@/lib/queries/settings";
import { getMarketLinks } from "@/lib/queries/markets";
import { getJobIndustries, searchJobs } from "@/lib/queries/job-orders";
import { paramPage, paramString, type SearchParams } from "@/lib/queries/params";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { JobFilters } from "@/components/public/job-filters";
import { getActiveJobPrograms } from "@/lib/queries/job-programs";
import { JobCard } from "@/components/public/job-card";
import { PublicPagination } from "@/components/public/public-pagination";
import { PublicEmptyState } from "@/components/public/empty-state";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const hasFilter = ["thi-truong", "nganh", "gioi-tinh", "tuoi", "luong", "q", "page"].some((k) => paramString(sp[k]));
  return buildMetadata(s, {
    title: "Đơn hàng xuất khẩu lao động đang tuyển",
    description: "Danh sách đơn hàng xuất khẩu lao động đang tuyển: Nhật Bản, Hàn Quốc, Đài Loan, Đức, châu Âu – lọc theo thị trường, ngành nghề, giới tính, độ tuổi, mức lương.",
    path: "/don-hang",
    // Trang có bộ lọc không cần index riêng từng tổ hợp
    noIndex: hasFilter,
  });
}

export default async function JobsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = {
    program: paramString(sp["chuong-trinh"]),
    market: paramString(sp["thi-truong"]),
    industry: paramString(sp["nganh"]),
    gender: paramString(sp["gioi-tinh"]),
    age: paramString(sp["tuoi"]),
    salary: paramString(sp["luong"]),
    q: paramString(sp["q"]),
    page: paramPage(sp["page"]),
  };

  const [s, markets, industries, programs, result] = await Promise.all([getSettings(), getMarketLinks(), getJobIndustries(), getActiveJobPrograms(), searchJobs(filters)]);
  const activeMarket = markets.find((m) => m.slug === filters.market);

  return (
    <>
      <PageHero
        title={activeMarket ? `Đơn hàng ${activeMarket.name} đang tuyển` : "Đơn hàng đang tuyển"}
        description="Cập nhật liên tục các đơn hàng lương cao, phỏng vấn sớm, xuất cảnh nhanh. Lọc theo thị trường, ngành nghề, giới tính, độ tuổi và mức lương để tìm đơn phù hợp."
        crumbs={activeMarket ? [{ label: "Đơn hàng", href: "/don-hang" }, { label: activeMarket.name }] : [{ label: "Đơn hàng" }]}
      />

      <section className="bg-muted py-10 md:py-14">
        <div className="container-page space-y-8">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl border bg-card" />}>
            <JobFilters markets={markets} industries={industries} programs={programs} />
          </Suspense>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <strong className="text-foreground">{result.total}</strong> đơn hàng
              {filters.q && (
                <>
                  {" "}
                  cho từ khóa “<strong className="text-foreground">{filters.q}</strong>”
                </>
              )}
              {result.totalPages > 1 && (
                <>
                  {" "}
                  – trang {result.page}/{result.totalPages}
                </>
              )}
            </p>
          </div>

          {result.items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          ) : (
            <PublicEmptyState
              title="Không tìm thấy đơn hàng phù hợp"
              description="Hãy thử bỏ một vài bộ lọc hoặc đăng ký tư vấn để được giới thiệu đơn hàng sắp mở."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild variant="outline" className="h-11">
                    <Link href="/don-hang">Xem tất cả đơn hàng</Link>
                  </Button>
                  <Button asChild className="h-11 bg-cta text-cta-foreground hover:bg-cta-hover">
                    <Link href="/dang-ky-tu-van">Đăng ký tư vấn</Link>
                  </Button>
                </div>
              }
            />
          )}

          <PublicPagination
            page={result.page}
            totalPages={result.totalPages}
            pathname="/don-hang"
            query={{ "chuong-trinh": filters.program, "thi-truong": filters.market, nganh: filters.industry, "gioi-tinh": filters.gender, tuoi: filters.age, luong: filters.salary, q: filters.q }}
          />
        </div>
      </section>

      <CtaSection hotline={s.hotline} title="Chưa tìm được đơn hàng ưng ý?" description="Để lại thông tin, chúng tôi sẽ báo ngay khi có đơn hàng mới phù hợp với điều kiện của bạn." />
    </>
  );
}
