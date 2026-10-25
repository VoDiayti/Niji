import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Clock, GraduationCap, Headset, Phone, ShieldCheck, Wallet } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getMarketOptions } from "@/lib/queries/markets";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { PageHero } from "@/components/public/page-hero";
import { LeadForm } from "@/components/public/lead-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Đăng ký tư vấn miễn phí",
    description: "Đăng ký tư vấn xuất khẩu lao động miễn phí: kiểm tra điều kiện, gợi ý thị trường và đơn hàng phù hợp, giải đáp chi phí và lộ trình xuất cảnh.",
    path: "/dang-ky-tu-van",
  });
}

const REASONS = [
  { Icon: ShieldCheck, title: "Được cấp phép hợp pháp", text: "Hoạt động theo giấy phép của cơ quan quản lý, hợp đồng rõ ràng, bảo vệ quyền lợi người lao động." },
  { Icon: Wallet, title: "Chi phí minh bạch, hỗ trợ vay vốn", text: "Công khai từng khoản phí trước khi ký, liên kết ngân hàng cho vay ưu đãi và trả góp." },
  { Icon: GraduationCap, title: "Đào tạo bài bản", text: "Trung tâm đào tạo tiếng và kỹ năng nghề, ký túc xá ngay tại trung tâm, cam kết đầu ra." },
  { Icon: Headset, title: "Hỗ trợ trọn gói trước – trong – sau", text: "Cán bộ đại diện tại nước ngoài, đường dây nóng tiếng Việt 24/7, hỗ trợ gia hạn và chuyển đổi visa." },
];

export default async function ConsultationPage() {
  const [s, markets] = await Promise.all([getSettings(), getMarketOptions()]);

  return (
    <>
      <PageHero
        title="Đăng ký tư vấn miễn phí"
        description="Để lại thông tin, tư vấn viên sẽ gọi lại trong 24 giờ để kiểm tra điều kiện và giới thiệu đơn hàng phù hợp nhất với bạn."
        crumbs={[{ label: "Đăng ký tư vấn" }]}
        image="/images/tu-van-vien.jpg"
      />

      <section className="bg-muted py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="order-1 rounded-2xl border bg-card p-6 shadow-lg md:p-8 lg:col-span-3">
            <LeadForm
              type="CONSULTATION"
              markets={markets}
              variant="full"
              title="Thông tin đăng ký"
              description="Các trường có dấu * là bắt buộc. Thông tin được bảo mật tuyệt đối."
              submitLabel="Gửi đăng ký tư vấn"
            />
          </div>

          {/* Lý do chọn */}
          <div className="order-2 space-y-6 lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Vì sao chọn chúng tôi</p>
              <h2 className="mt-1 text-xl font-bold text-brand-dark md:text-2xl">{s.shortName || s.companyName} đồng hành cùng bạn</h2>
              <ul className="mt-5 space-y-4">
                {REASONS.map((r) => (
                  <li key={r.title} className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-primary">
                      <r.Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              {s.licenseNumber && (
                <p className="mt-5 flex items-start gap-2 rounded-xl bg-brand-light p-3 text-sm">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    Giấy phép số <strong>{s.licenseNumber}</strong>
                    {s.licenseIssuer && <> – {s.licenseIssuer}</>}
                  </span>
                </p>
              )}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-brand-dark p-6 text-white">
              <Image src="/images/thanh-cong.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover opacity-25" />
              <div className="relative">
                <p className="text-sm text-white/80">Cần hỗ trợ ngay?</p>
                <a href={telHref(s.hotline)} className="mt-1 inline-flex items-center gap-2 text-2xl font-extrabold text-amber-300 hover:underline">
                  <Phone className="size-6" /> {s.hotline}
                </a>
                {s.workingHours && (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/85">
                    <Clock className="size-4" /> {s.workingHours}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
