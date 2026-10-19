import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  Clock,
  Eye,
  MapPin,
  Phone,
  PlaneTakeoff,
  Send,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getJobBySlug, getRelatedJobs, isDeadlinePassed } from "@/lib/queries/job-orders";
import { buildMetadata, jobPostingJsonLd, plainText } from "@/lib/seo";
import { GENDER_LABELS } from "@/lib/constants";
import { formatDate, formatNumber, telHref } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { InfoItem } from "@/components/public/info-item";
import { JobCard, formatAgeRange } from "@/components/public/job-card";
import { LeadForm } from "@/components/public/lead-form";
import { CountryFlag } from "@/components/public/country-flag";
import { JobApplyBar } from "@/components/public/job-apply-bar";
import { SectionHeading } from "@/components/public/section-heading";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, job] = await Promise.all([getSettings(), getJobBySlug(slug)]);
  if (!job) return { title: "Không tìm thấy đơn hàng" };
  return buildMetadata(s, {
    title: job.title,
    description: plainText(job.description, 300) || `${job.title} – ${job.market.name}. ${job.salaryText ?? ""}`,
    path: `/don-hang/${job.slug}`,
    image: job.image || job.market.image,
  });
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const [s, job] = await Promise.all([getSettings(), getJobBySlug(slug)]);
  if (!job) notFound();
  const related = await getRelatedJobs(job.marketId, job.id, 3);
  const expired = isDeadlinePassed(job.deadline);

  return (
    <>
      <JsonLd data={jobPostingJsonLd(s, job)} />

      <div className="border-b bg-muted/60">
        <div className="container-page py-4">
          <Breadcrumbs items={[{ label: "Đơn hàng", href: "/don-hang" }, { label: job.market.name, href: `/don-hang?thi-truong=${job.market.slug}` }, { label: job.title }]} />
        </div>
      </div>

      <section className="bg-background py-8 md:py-12">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          {/* Nội dung chính */}
          <div className="space-y-8 lg:col-span-2">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <Badge asChild className="gap-1 bg-brand-light text-primary hover:bg-brand-light">
                  <Link href={`/thi-truong/${job.market.slug}`}>
                    <CountryFlag code={job.market.countryCode} className="text-sm" /> {job.market.name}
                  </Link>
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Briefcase className="size-3" /> {job.industry}
                </Badge>
                {job.isFeatured && <Badge className="bg-cta text-cta-foreground">Nổi bật</Badge>}
                {expired ? <Badge variant="destructive">Hết hạn nộp hồ sơ</Badge> : <Badge className="bg-emerald-600 text-white">Đang tuyển</Badge>}
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight text-brand-dark md:text-4xl">{job.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-4" /> Đăng ngày {formatDate(job.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-4" /> {formatNumber(job.viewCount)} lượt xem
                </span>
              </p>
            </header>

            {job.image && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-md">
                <Image src={job.image} alt={job.title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
              </div>
            )}

            {/* Thông tin tuyển dụng */}
            <div className="rounded-2xl border bg-card p-5 md:p-6">
              <h2 className="text-lg font-bold text-brand-dark md:text-xl">Thông tin tuyển dụng</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem icon={Banknote} label="Mức lương" value={job.salaryText} highlight className="sm:col-span-2" />
                <InfoItem icon={Users} label="Số lượng tuyển" value={`${job.quantity} người`} />
                <InfoItem icon={UserRound} label="Giới tính" value={GENDER_LABELS[job.gender]} />
                <InfoItem icon={CalendarClock} label="Độ tuổi" value={formatAgeRange(job.ageMin, job.ageMax)} />
                <InfoItem icon={MapPin} label="Nơi làm việc" value={job.location || job.market.name} />
                <InfoItem icon={Wallet} label="Chi phí" value={job.cost} />
                <InfoItem icon={Clock} label="Hạn nộp hồ sơ" value={job.deadline ? formatDate(job.deadline) : "Tuyển liên tục"} />
                <InfoItem icon={CalendarCheck} label="Ngày thi tuyển dự kiến" value={job.interviewDate ? formatDate(job.interviewDate) : null} />
                <InfoItem icon={PlaneTakeoff} label="Xuất cảnh" value={job.departureNote} className={job.interviewDate ? undefined : "sm:col-span-2"} />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 flex-1 bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
                  <a href="#ung-tuyen">
                    <Send className="size-5" /> Ứng tuyển ngay
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 flex-1 text-base">
                  <a href={telHref(s.hotline)}>
                    <Phone className="size-5" /> Gọi {s.hotline}
                  </a>
                </Button>
              </div>
            </div>

            {job.description && (
              <section>
                <h2 className="mb-3 text-xl font-bold text-brand-dark md:text-2xl">Mô tả công việc</h2>
                <RichContent html={job.description} />
              </section>
            )}
            {job.requirements && (
              <section className="rounded-2xl border bg-card p-6">
                <h2 className="mb-3 text-xl font-bold text-brand-dark md:text-2xl">Yêu cầu ứng viên</h2>
                <RichContent html={job.requirements} />
              </section>
            )}
            {job.benefits && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
                <h2 className="mb-3 text-xl font-bold text-brand-dark md:text-2xl">Quyền lợi</h2>
                <RichContent html={job.benefits} />
              </section>
            )}
          </div>

          {/* Cột phải */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div id="ung-tuyen" className="scroll-mt-28 rounded-2xl border-2 border-cta/30 bg-card p-6 shadow-lg">
              <LeadForm type="APPLICATION" marketId={job.marketId} jobOrderId={job.id} title="Ứng tuyển đơn hàng này" description={`Gửi thông tin để ứng tuyển “${job.title}”. Tư vấn viên sẽ liên hệ hướng dẫn hồ sơ.`} submitLabel="Gửi hồ sơ ứng tuyển" />
            </div>
            <a href={telHref(s.hotline)} className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-brand-dark">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-primary-foreground/80">Hotline tư vấn đơn hàng</span>
                <span className="block text-xl font-bold">{s.hotline}</span>
              </span>
            </a>
            <Link href={`/thi-truong/${job.market.slug}`} className="group relative block overflow-hidden rounded-2xl bg-brand-dark text-white">
              {job.market.image && <Image src={job.market.image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover opacity-50 transition-transform duration-500 group-hover:scale-105" />}
              <div className="relative p-5">
                <p className="text-xs uppercase tracking-wider text-amber-300">Tìm hiểu thị trường</p>
                <p className="mt-1 flex items-center gap-2 text-xl font-bold">
                  <CountryFlag code={job.market.countryCode} /> {job.market.name}
                </p>
                {job.market.summary && <p className="mt-2 line-clamp-2 text-sm text-white/85">{job.market.summary}</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                  Xem chi tiết <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-muted py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Đơn hàng liên quan" title={`Đơn hàng khác tại ${job.market.name}`} className="mb-0" />
              <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold">
                <Link href={`/don-hang?thi-truong=${job.market.slug}`}>
                  Xem tất cả <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chừa chỗ cho thanh ứng tuyển cố định trên di động */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <JobApplyBar hotline={s.hotline} />
    </>
  );
}
