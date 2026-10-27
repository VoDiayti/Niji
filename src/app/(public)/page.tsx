import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CircleCheck, Phone, ShieldCheck, Wallet, GraduationCap, Headset } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getFeaturedMarkets, getMarketOptions } from "@/lib/queries/markets";
import { getLatestJobs } from "@/lib/queries/job-orders";
import { getJobTableGroups } from "@/lib/queries/job-programs";
import { JobTableSection } from "@/components/public/job-table-section";
import { getLatestPosts } from "@/lib/queries/posts";
import { getActiveBanners, getActivePartners, getActiveTestimonials } from "@/lib/queries/site-content";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/public/hero-slider";
import { SectionHeading } from "@/components/public/section-heading";
import { MarketCard } from "@/components/public/market-card";
import { JobCard } from "@/components/public/job-card";
import { PostCard } from "@/components/public/post-card";
import { StatsSection } from "@/components/public/stats-section";
import { ProcessSteps } from "@/components/public/process-steps";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { PartnersSection } from "@/components/public/partners-section";
import { LeadForm } from "@/components/public/lead-form";
import { PublicEmptyState } from "@/components/public/empty-state";
import { YouTubeEmbed } from "@/components/public/youtube-embed";

export const dynamic = "force-dynamic";

/** Video giới thiệu công ty (https://www.youtube.com/watch?v=eaegwNEhW98) */
const INTRO_VIDEO_ID = "eaegwNEhW98";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: s.metaTitle || `${s.shortName || s.companyName} – Xuất khẩu lao động uy tín`,
    absoluteTitle: true,
    description: s.metaDescription,
    path: "/",
  });
}

const TRUST_POINTS = [
  { Icon: ShieldCheck, title: "Pháp lý đầy đủ", text: "Được cấp phép đưa lao động đi làm việc ở nước ngoài theo hợp đồng." },
  { Icon: Wallet, title: "Chi phí minh bạch", text: "Công khai mọi khoản phí trước khi ký, hỗ trợ vay vốn ngân hàng." },
  { Icon: GraduationCap, title: "Đào tạo bài bản", text: "Trung tâm đào tạo tiếng và kỹ năng nghề, ký túc xá ngay tại trung tâm." },
  { Icon: Headset, title: "Hỗ trợ trọn gói", text: "Cán bộ đại diện tại nước ngoài, đường dây nóng tiếng Việt 24/7." },
];

export default async function HomePage() {
  const [s, banners, markets, jobs, posts, testimonials, partners, marketOptions, jobTable] = await Promise.all([
    getSettings(),
    getActiveBanners(),
    getFeaturedMarkets(6),
    getLatestJobs(6),
    getLatestPosts(4),
    getActiveTestimonials(6),
    getActivePartners(),
    getMarketOptions(),
    getJobTableGroups(),
  ]);

  const heroBanners =
    banners.length > 0
      ? banners
      : [
          {
            id: "default",
            title: s.slogan || s.companyName,
            subtitle: s.aboutShort,
            image: "/images/hero-xuat-canh.jpg",
            ctaText: "Đăng ký tư vấn",
            ctaLink: "/dang-ky-tu-van",
            ctaText2: "Xem đơn hàng",
            ctaLink2: "/don-hang",
          },
        ];

  return (
    <>
      <HeroSlider banners={heroBanners} hotline={s.hotline} />

      {/* Điểm tin cậy */}
      <section className="relative z-10 -mt-10 md:-mt-12">
        <div className="container-page">
          <ul className="grid gap-4 rounded-2xl border bg-card p-4 shadow-lg md:grid-cols-4 md:p-6">
            {TRUST_POINTS.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-primary">
                  <p.Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bảng đơn hàng theo chương trình (tab) – bật/tắt & tiêu đề trong Admin → Cài đặt chung */}
      {s.jobTableEnabled && <JobTableSection title={s.jobTableTitle || "Việc làm tại Nhật Bản & các thị trường"} groups={jobTable} />}

      {/* Giới thiệu ngắn */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
              <Image src="/images/tu-van-vien.jpg" alt="Tư vấn viên hướng dẫn người lao động" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden w-56 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:block md:-right-6">
              <div className="relative aspect-[4/3]">
                <Image src="/images/thanh-cong.jpg" alt="Học viên trúng tuyển đơn hàng" fill sizes="224px" className="object-cover" />
              </div>
            </div>
            {s.statYears && (
              <div className="absolute -left-2 top-6 rounded-2xl bg-cta px-4 py-3 text-cta-foreground shadow-lg md:-left-6">
                <p className="text-3xl font-extrabold leading-none">{s.statYears}+</p>
                <p className="text-xs font-medium">năm kinh nghiệm</p>
              </div>
            )}
          </div>
          <div>
            <SectionHeading align="left" label="Về chúng tôi" title={s.companyName} className="mb-5" />
            {s.aboutShort && <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{s.aboutShort}</p>}
            {s.licenseNumber && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-brand-light p-4">
                <BadgeCheck className="mt-0.5 size-6 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-brand-dark">Giấy phép số {s.licenseNumber}</p>
                  {s.licenseIssuer && <p className="text-sm text-muted-foreground">Do {s.licenseIssuer} cấp – hoạt động dịch vụ đưa người lao động đi làm việc ở nước ngoài theo hợp đồng.</p>}
                </div>
              </div>
            )}
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {["Tư vấn miễn phí, không ép buộc", "Hợp đồng rõ ràng, đúng pháp luật", "Hoàn phí nếu không trúng tuyển", "Đồng hành đến khi về nước"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm font-medium">
                  <CircleCheck className="size-5 shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/gioi-thieu">
                  Tìm hiểu thêm <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <a href={telHref(s.hotline)}>
                  <Phone className="size-5" /> {s.hotline}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video giới thiệu: vắt ngang ranh giới nền trắng (Giới thiệu) và nền hồng (Thị trường), chia đúng giữa chiều cao video */}
      <div className="bg-[linear-gradient(to_bottom,var(--background)_50%,var(--brand-light)_50%)]">
        <div className="container-page">
          <YouTubeEmbed videoId={INTRO_VIDEO_ID} title={`Video giới thiệu ${s.companyName}`} className="mx-auto max-w-md border-4 border-background shadow-2xl" />
        </div>
      </div>

      {/* Thị trường nổi bật */}
      <section className="bg-brand-light py-14 md:py-20">
        <div className="container-page">
          <SectionHeading
            label="Thị trường"
            title="Thị trường lao động nổi bật"
            description="Lựa chọn thị trường phù hợp với sức khỏe, trình độ và mục tiêu thu nhập của bạn. Mỗi thị trường đều có lộ trình và chi phí rõ ràng."
          />
          {markets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {markets.map((m, i) => (
                <MarketCard key={m.id} market={m} priority={i < 3} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Thông tin thị trường đang được cập nhật" />
          )}
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="h-12 bg-background px-6 text-base">
              <Link href="/thi-truong">
                Xem tất cả thị trường <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Đơn hàng mới nhất */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <SectionHeading align="left" label="Đơn hàng" title="Đơn hàng đang tuyển mới nhất" description="Cập nhật liên tục các đơn hàng lương cao, phỏng vấn sớm, xuất cảnh nhanh." className="mb-0" />
            <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold md:justify-end">
              <Link href="/don-hang">
                Xem tất cả đơn hàng <ArrowRight className="size-4" />
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
            <PublicEmptyState title="Hiện chưa có đơn hàng đang tuyển" description="Hãy để lại thông tin để được báo ngay khi có đơn hàng mới." />
          )}
        </div>
      </section>

      <StatsSection statWorkers={s.statWorkers} statYears={s.statYears} statPartners={s.statPartners} statMarkets={s.statMarkets} />

      <ProcessSteps />

      <TestimonialsSection testimonials={testimonials} />

      {/* Tin tức */}
      {posts.length > 0 && (
        <section className="bg-background py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Tin tức" title="Tin tức & kinh nghiệm mới nhất" className="mb-0" />
              <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold md:justify-end">
                <Link href="/tin-tuc">
                  Xem tất cả tin tức <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Form đăng ký nhanh */}
      <section id="dang-ky" className="relative overflow-hidden bg-brand-dark py-14 text-white md:py-20">
        <Image src="/images/hoi-thao.jpg" alt="" fill sizes="100vw" className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-primary/70" />
        <div className="container-page relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Đăng ký tư vấn</p>
            <h2 className="mt-2 text-2xl font-bold md:text-4xl">Nhận tư vấn lộ trình phù hợp trong 24 giờ</h2>
            <p className="mt-4 text-white/85 md:text-lg">
              Để lại số điện thoại, tư vấn viên sẽ gọi lại để kiểm tra điều kiện, giới thiệu đơn hàng, chi phí và thời gian xuất cảnh dự kiến. Hoàn toàn miễn phí.
            </p>
            <ul className="mt-6 space-y-3">
              {["Kiểm tra điều kiện sức khỏe, độ tuổi, trình độ", "Gợi ý thị trường và đơn hàng phù hợp", "Giải đáp chi phí, hỗ trợ vay vốn", "Lịch học tiếng và phỏng vấn gần nhất"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-amber-300" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <a href={telHref(s.hotline)} className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur hover:bg-white/15">
              <span className="flex size-11 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-white/70">Hoặc gọi ngay hotline</span>
                <span className="block text-xl font-bold">{s.hotline}</span>
              </span>
            </a>
          </div>
          <div className="rounded-3xl bg-background p-6 text-foreground shadow-2xl sm:p-8">
            <LeadForm type="CONSULTATION" markets={marketOptions} variant="compact" title="Đăng ký tư vấn miễn phí" description="Điền thông tin, chúng tôi sẽ liên hệ lại sớm nhất." />
          </div>
        </div>
      </section>

      <PartnersSection partners={partners} />
    </>
  );
}
