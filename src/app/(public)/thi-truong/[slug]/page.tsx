import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Banknote, Briefcase, CircleCheck, Clock, Phone, Wallet } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getMarketBySlug } from "@/lib/queries/markets";
import { getJobsByMarket } from "@/lib/queries/job-orders";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { InfoItem } from "@/components/public/info-item";
import { JobCard } from "@/components/public/job-card";
import { LeadForm } from "@/components/public/lead-form";
import { CountryFlag } from "@/components/public/country-flag";
import { SectionHeading } from "@/components/public/section-heading";
import { CtaSection } from "@/components/public/cta-section";
import { parseStringList } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, market] = await Promise.all([getSettings(), getMarketBySlug(slug)]);
  if (!market) return { title: "Không tìm thấy thị trường" };
  return buildMetadata(s, {
    title: market.metaTitle || `Xuất khẩu lao động ${market.name}`,
    absoluteTitle: Boolean(market.metaTitle),
    description: market.metaDescription || market.summary,
    path: `/thi-truong/${market.slug}`,
    image: market.image,
  });
}

export default async function MarketDetailPage({ params }: Props) {
  const { slug } = await params;
  const [s, market] = await Promise.all([getSettings(), getMarketBySlug(slug)]);
  if (!market) notFound();
  const jobs = await getJobsByMarket(market.id, 6);

  return (
    <>
      <PageHero
        title={`Xuất khẩu lao động ${market.name}`}
        description={market.summary}
        crumbs={[{ label: "Thị trường", href: "/thi-truong" }, { label: market.name }]}
        image={market.image}
        size="large"
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <CountryFlag code={market.countryCode} className="text-xl" /> {market.name}
          </span>
          <Button asChild size="lg" className="h-12 bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta-hover">
            <a href="#dang-ky">
              Đăng ký tư vấn thị trường này <ArrowRight className="size-5" />
            </a>
          </Button>
        </div>
      </PageHero>

      {/* Thông tin nhanh */}
      <section className="relative z-10 -mt-8 md:-mt-10">
        <div className="container-page">
          <div className="grid gap-3 rounded-2xl border bg-card p-3 shadow-lg sm:grid-cols-2 lg:grid-cols-4 md:gap-4 md:p-4">
            <InfoItem icon={Banknote} label="Mức lương" value={market.salaryRange} highlight className="border-0 bg-orange-50/80" />
            <InfoItem icon={Wallet} label="Chi phí" value={market.cost} className="border-0 bg-muted/60" />
            <InfoItem icon={Clock} label="Thời gian hợp đồng" value={market.duration} className="border-0 bg-muted/60" />
            <InfoItem icon={Briefcase} label="Ngành nghề phổ biến" value={parseStringList(market.industries).length ? parseStringList(market.industries).join(", ") : null} className="border-0 bg-muted/60" />
          </div>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {parseStringList(market.highlights).length > 0 && (
              <div className="rounded-2xl border border-primary/15 bg-brand-light p-6 md:p-8">
                <h2 className="text-xl font-bold text-brand-dark md:text-2xl">Vì sao chọn thị trường {market.name}?</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {parseStringList(market.highlights).map((h) => (
                    <li key={h} className="flex items-start gap-2.5">
                      <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {market.description && (
              <div>
                <RichContent html={market.description} className="prose-lg prose-h2:text-brand-dark" />
              </div>
            )}

            {market.requirements && (
              <div className="rounded-2xl border bg-card p-6 md:p-8">
                <h2 className="text-xl font-bold text-brand-dark md:text-2xl">Điều kiện tham gia</h2>
                <RichContent html={market.requirements} className="mt-3" />
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div id="dang-ky" className="scroll-mt-28 rounded-2xl border bg-card p-6 shadow-sm">
              <LeadForm type="CONSULTATION" marketId={market.id} title={`Tư vấn thị trường ${market.name}`} description="Để lại thông tin, tư vấn viên sẽ gọi lại cho bạn trong 24 giờ." />
            </div>
            <a href={telHref(s.hotline)} className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-brand-dark">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-primary-foreground/80">Gọi hotline tư vấn</span>
                <span className="block text-xl font-bold">{s.hotline}</span>
              </span>
            </a>
          </aside>
        </div>
      </section>

      {/* Đơn hàng của thị trường */}
      <section className="bg-muted py-14 md:py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading align="left" label="Đơn hàng" title={`Đơn hàng ${market.name} đang tuyển`} className="mb-0" />
            <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold">
              <Link href={`/don-hang?thi-truong=${market.slug}`}>
                Xem tất cả đơn {market.name} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          {jobs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
              <p className="text-lg font-semibold">Hiện chưa có đơn hàng đang tuyển cho thị trường này</p>
              <p className="mt-1 text-muted-foreground">Đăng ký tư vấn để được báo ngay khi có đơn hàng mới.</p>
              <Button asChild className="mt-5 h-11 bg-cta text-cta-foreground hover:bg-cta-hover">
                <a href="#dang-ky">Đăng ký nhận thông báo</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      <CtaSection hotline={s.hotline} />
    </>
  );
}
