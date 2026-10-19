import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, GraduationCap, Phone, Wallet } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getOtherPrograms, getProgramBySlug } from "@/lib/queries/programs";
import { getMarketOptions } from "@/lib/queries/markets";
import { PROGRAM_TYPE_LABELS } from "@/lib/constants";
import { buildMetadata, plainText } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { PageHero } from "@/components/public/page-hero";
import { InfoItem } from "@/components/public/info-item";
import { LeadForm } from "@/components/public/lead-form";
import { ProgramCard } from "@/components/public/program-card";
import { SectionHeading } from "@/components/public/section-heading";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, program] = await Promise.all([getSettings(), getProgramBySlug(slug)]);
  if (!program) return { title: "Không tìm thấy chương trình" };
  return buildMetadata(s, {
    title: program.title,
    description: program.summary || plainText(program.content, 300),
    path: `/du-hoc-dao-tao/${program.slug}`,
    image: program.image,
  });
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const [s, program] = await Promise.all([getSettings(), getProgramBySlug(slug)]);
  if (!program) notFound();
  const [others, markets] = await Promise.all([getOtherPrograms(program.id, 3), getMarketOptions()]);

  return (
    <>
      <PageHero
        title={program.title}
        description={program.summary}
        crumbs={[{ label: "Du học – Đào tạo", href: "/du-hoc-dao-tao" }, { label: program.title }]}
        image={program.image}
        size="large"
      />

      <section className="relative z-10 -mt-8 md:-mt-10">
        <div className="container-page">
          <div className="grid gap-3 rounded-2xl border bg-card p-3 shadow-lg sm:grid-cols-3 md:gap-4 md:p-4">
            <InfoItem icon={GraduationCap} label="Loại chương trình" value={PROGRAM_TYPE_LABELS[program.type]} className="border-0 bg-muted/60" />
            <InfoItem icon={Clock} label="Thời gian" value={program.duration} className="border-0 bg-muted/60" />
            <InfoItem icon={Wallet} label="Học phí" value={program.tuition} highlight className="border-0 bg-orange-50/80" />
          </div>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {program.content ? (
              <RichContent html={program.content} className="prose-lg prose-h2:text-brand-dark" />
            ) : (
              <p className="text-muted-foreground">Nội dung chương trình đang được cập nhật.</p>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div id="dang-ky" className="scroll-mt-28 rounded-2xl border bg-card p-6 shadow-sm">
              <LeadForm type="CONSULTATION" markets={markets} title="Đăng ký tư vấn chương trình" description={`Nhận lịch khai giảng, học phí và lộ trình của “${program.title}”.`} />
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

      {others.length > 0 && (
        <section className="bg-brand-light py-14 md:py-20">
          <div className="container-page">
            <SectionHeading label="Chương trình khác" title="Có thể bạn quan tâm" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection hotline={s.hotline} />
    </>
  );
}
