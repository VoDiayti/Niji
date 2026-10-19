import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Languages, Wrench } from "lucide-react";
import type { ProgramType } from "@/generated/prisma/enums";
import { getSettings } from "@/lib/queries/settings";
import { getActivePrograms } from "@/lib/queries/programs";
import { PROGRAM_TYPE_LABELS } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/public/page-hero";
import { ProgramCard } from "@/components/public/program-card";
import { PublicEmptyState } from "@/components/public/empty-state";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Du học – Đào tạo",
    description: "Chương trình du học nghề Đức, khóa đào tạo tiếng Nhật, Hàn, Đức và đào tạo kỹ năng nghề trước khi xuất cảnh.",
    path: "/du-hoc-dao-tao",
    image: "/images/lop-hoc-laptop.jpg",
  });
}

const GROUPS: { type: ProgramType; description: string; Icon: typeof GraduationCap }[] = [
  { type: "STUDY_ABROAD", description: "Vừa học vừa làm có lương, nhận bằng nghề được công nhận quốc tế và cơ hội định cư lâu dài.", Icon: GraduationCap },
  { type: "LANGUAGE", description: "Khóa học tiếng tập trung, giáo viên bản ngữ, luyện phỏng vấn – nền tảng để trúng tuyển và hòa nhập nhanh.", Icon: Languages },
  { type: "VOCATIONAL", description: "Thực hành tay nghề tại xưởng của trung tâm để tự tin làm việc ngay khi sang nước ngoài.", Icon: Wrench },
];

export default async function ProgramsPage() {
  const [s, programs] = await Promise.all([getSettings(), getActivePrograms()]);
  const groups = GROUPS.map((g) => ({ ...g, items: programs.filter((p) => p.type === g.type) })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero
        title="Du học nghề & Đào tạo"
        description="Từ khóa tiếng cấp tốc đến du học nghề có lương tại châu Âu – lộ trình học tập rõ ràng, cam kết đầu ra."
        crumbs={[{ label: "Du học – Đào tạo" }]}
        image="/images/du-hoc-thu-vien.jpg"
      >
        {groups.length > 1 && (
          <nav aria-label="Nhóm chương trình" className="mt-6 flex flex-wrap gap-2">
            {groups.map((g) => (
              <Link key={g.type} href={`#${g.type.toLowerCase()}`} className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white hover:text-brand-dark">
                <g.Icon className="size-4" /> {PROGRAM_TYPE_LABELS[g.type]} ({g.items.length})
              </Link>
            ))}
          </nav>
        )}
      </PageHero>

      {groups.length === 0 ? (
        <section className="py-14 md:py-20">
          <div className="container-page">
            <PublicEmptyState title="Chương trình đang được cập nhật" description="Vui lòng liên hệ hotline để biết lịch khai giảng gần nhất." />
          </div>
        </section>
      ) : (
        groups.map((g, i) => (
          <section key={g.type} id={g.type.toLowerCase()} className={`scroll-mt-24 py-14 md:py-20 ${i % 2 === 0 ? "bg-background" : "bg-brand-light"}`}>
            <div className="container-page">
              <div className="mb-10 flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <g.Icon className="size-6" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-brand-dark md:text-3xl">{PROGRAM_TYPE_LABELS[g.type]}</h2>
                  <p className="mt-1 text-muted-foreground md:text-lg">{g.description}</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((p) => (
                  <ProgramCard key={p.id} program={p} />
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      <CtaSection hotline={s.hotline} title="Muốn biết lịch khai giảng gần nhất?" description="Đăng ký để nhận tư vấn lộ trình học tập, học phí và chính sách hỗ trợ dành cho bạn." />
    </>
  );
}
