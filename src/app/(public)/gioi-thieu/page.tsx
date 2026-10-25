import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Building, CalendarDays, CircleCheck, Eye, Target, Users } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { PageHero } from "@/components/public/page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { Gallery } from "@/components/public/gallery";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Giới thiệu",
    description: s.aboutShort || `Giới thiệu về ${s.companyName} – đơn vị xuất khẩu lao động được cấp phép, đào tạo bài bản, hỗ trợ trọn gói.`,
    path: "/gioi-thieu",
    image: "/images/hop-doi-ngu.jpg",
  });
}

const TEAM_POINTS = [
  "Tư vấn viên nắm rõ từng thị trường, nhiều người từng là thực tập sinh, kỹ sư tại Nhật Bản, Hàn Quốc",
  "Giáo viên tiếng Nhật, Hàn, Đức, Trung có chứng chỉ, kết hợp giáo viên bản ngữ",
  "Cán bộ đại diện tại nước ngoài hỗ trợ người lao động 24/7",
  "Bộ phận hồ sơ – visa giàu kinh nghiệm, tỷ lệ đỗ visa cao",
];

const FACILITY_POINTS = [
  "Phòng học hiện đại, máy chiếu, phòng lab luyện nghe – nói",
  "Xưởng thực hành kỹ năng nghề: cơ khí, xây dựng, điều dưỡng",
  "Khu ký túc xá, nhà ăn, sân thể lực ngay trong trung tâm",
  "Phòng mô phỏng phỏng vấn trực tuyến với nghiệp đoàn, doanh nghiệp",
];

const GALLERY = [
  { src: "/images/hero-xuat-canh.jpg", alt: "Lễ xuất cảnh của người lao động", caption: "Lễ tiễn người lao động xuất cảnh" },
  { src: "/images/hoi-thao.jpg", alt: "Hội thảo tư vấn việc làm", caption: "Hội thảo tư vấn việc làm" },
  { src: "/images/thanh-cong.jpg", alt: "Học viên trúng tuyển", caption: "Học viên trúng tuyển đơn hàng" },
  { src: "/images/doi-tac-bat-tay.jpg", alt: "Ký kết hợp tác với đối tác", caption: "Ký kết với đối tác tiếp nhận" },
  { src: "/images/du-hoc-thu-vien.jpg", alt: "Học viên du học nghề", caption: "Học viên chương trình du học nghề" },
];

export default async function AboutPage() {
  const s = await getSettings();
  const shortName = s.shortName || s.companyName;

  const stats = [
    { label: "Lao động xuất cảnh", value: s.statWorkers, Icon: Users },
    { label: "Năm kinh nghiệm", value: s.statYears, Icon: CalendarDays },
    { label: "Đối tác tiếp nhận", value: s.statPartners, Icon: Building },
  ].filter((x) => x.value);

  return (
    <>
      <PageHero
        title={`Giới thiệu về ${shortName}`}
        description={s.slogan}
        crumbs={[{ label: "Giới thiệu" }]}
        image="/images/hop-doi-ngu.jpg"
        size="large"
      />

      {/* Tổng quan */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading align="left" label="Chúng tôi là ai" title={s.companyName} className="mb-5" />
            {s.aboutShort && <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{s.aboutShort}</p>}
            {stats.length > 0 && (
              <dl className="mt-8 grid grid-cols-3 gap-3">
                {stats.map((x) => (
                  <div key={x.label} className="rounded-2xl border bg-card p-4 text-center">
                    <x.Icon className="mx-auto size-5 text-primary" />
                    <dd className="mt-2 text-2xl font-extrabold text-brand-dark md:text-3xl">{formatNumber(x.value)}+</dd>
                    <dt className="mt-0.5 text-xs text-muted-foreground md:text-sm">{x.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image src="/images/lam-viec-nhom.jpg" alt="Đội ngũ công ty làm việc" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Tầm nhìn – Sứ mệnh */}
      {(s.vision || s.mission) && (
        <section className="bg-brand-light py-14 md:py-20">
          <div className="container-page">
            <SectionHeading label="Định hướng" title="Tầm nhìn & Sứ mệnh" />
            <div className="grid gap-6 md:grid-cols-2">
              {s.vision && (
                <div className="rounded-2xl border bg-card p-7 shadow-sm">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Eye className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-brand-dark">Tầm nhìn</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.vision}</p>
                </div>
              )}
              {s.mission && (
                <div className="rounded-2xl border bg-card p-7 shadow-sm">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-cta text-cta-foreground">
                    <Target className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-brand-dark">Sứ mệnh</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.mission}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Nội dung chi tiết + giấy phép */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {s.aboutContent ? (
              <RichContent html={s.aboutContent} className="prose-lg prose-h2:text-brand-dark" />
            ) : (
              <p className="text-muted-foreground">Nội dung giới thiệu đang được cập nhật.</p>
            )}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-primary/15 bg-brand-light p-6">
              <BadgeCheck className="size-9 text-primary" />
              <h3 className="mt-3 text-lg font-bold text-brand-dark">Giấy phép hoạt động</h3>
              {s.licenseNumber ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Giấy phép số <strong className="text-foreground">{s.licenseNumber}</strong>
                  {s.licenseIssuer && <> do {s.licenseIssuer} cấp</>} về hoạt động dịch vụ đưa người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng.
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Đang cập nhật.</p>
              )}
              <ul className="mt-4 space-y-1.5 text-sm">
                {s.foundedYear && (
                  <li>
                    <span className="text-muted-foreground">Năm thành lập: </span>
                    <strong>{s.foundedYear}</strong>
                  </li>
                )}
                {s.taxCode && (
                  <li>
                    <span className="text-muted-foreground">Mã số thuế: </span>
                    <strong>{s.taxCode}</strong>
                  </li>
                )}
                {s.address && (
                  <li>
                    <span className="text-muted-foreground">Trụ sở: </span>
                    {s.address}
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Đội ngũ */}
      <section className="bg-muted py-14 md:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
              <Image src="/images/hop-doi-ngu.jpg" alt="Đội ngũ tư vấn viên họp bàn" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
              <Image src="/images/lam-viec-nhom.jpg" alt="Đội ngũ làm việc nhóm" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
          </div>
          <div>
            <SectionHeading align="left" label="Đội ngũ" title="Những người đồng hành tận tâm" description="Đội ngũ cán bộ, giáo viên và tư vấn viên giàu kinh nghiệm – thấu hiểu khó khăn của người lao động vì nhiều người trong số họ đã từng đi làm việc ở nước ngoài." className="mb-6" />
            <ul className="space-y-3">
              {TEAM_POINTS.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cơ sở đào tạo */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <SectionHeading align="left" label="Cơ sở đào tạo" title="Trung tâm đào tạo tiếng & kỹ năng nghề" description="Học viên được đào tạo tập trung trước khi xuất cảnh để tự tin về ngoại ngữ, tay nghề và tác phong làm việc." className="mb-6" />
            <ul className="space-y-3">
              {FACILITY_POINTS.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 grid grid-cols-2 gap-4 lg:order-2">
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
              <Image src="/images/lop-hoc-laptop.jpg" alt="Lớp học tiếng tại trung tâm đào tạo" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 aspect-[16/7] overflow-hidden rounded-2xl shadow-lg">
              <Image src="/images/dao-tao-may-tinh.jpg" alt="Phòng máy tính luyện thi" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Hình ảnh hoạt động */}
      <section className="bg-brand-light py-14 md:py-20">
        <div className="container-page">
          <SectionHeading label="Hình ảnh" title="Hoạt động của công ty" />
          <Gallery images={GALLERY} />
        </div>
      </section>

      <CtaSection hotline={s.hotline} />
    </>
  );
}
