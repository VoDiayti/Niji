import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { telHref, zaloHref } from "@/lib/format";
import { PageHero } from "@/components/public/page-hero";
import { LeadForm } from "@/components/public/lead-form";
import { SocialLinks } from "@/components/public/social-icons";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Liên hệ",
    description: `Liên hệ ${s.companyName}: hotline ${s.hotline}${s.email ? `, email ${s.email}` : ""}${s.address ? `, địa chỉ ${s.address}` : ""}.`,
    path: "/lien-he",
  });
}

export default async function ContactPage() {
  const s = await getSettings();
  const items = [
    s.address && { Icon: MapPin, label: "Địa chỉ văn phòng", value: s.address, href: undefined },
    { Icon: Phone, label: "Hotline", value: s.hotline, href: telHref(s.hotline) },
    s.email && { Icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s.workingHours && { Icon: Clock, label: "Giờ làm việc", value: s.workingHours, href: undefined },
  ].filter((x): x is { Icon: typeof MapPin; label: string; value: string; href: string | undefined } => Boolean(x));

  return (
    <>
      <PageHero
        title="Liên hệ với chúng tôi"
        description="Đội ngũ tư vấn luôn sẵn sàng giải đáp mọi thắc mắc về đơn hàng, chi phí, thủ tục. Hãy gọi, nhắn tin hoặc ghé văn phòng."
        crumbs={[{ label: "Liên hệ" }]}
      />

      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          {/* Thông tin liên hệ */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold text-brand-dark">{s.companyName}</h2>
              <ul className="mt-5 space-y-4">
                {items.map((it) => (
                  <li key={it.label} className="flex gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-primary">
                      <it.Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{it.label}</p>
                      {it.href ? (
                        <a href={it.href} className="mt-0.5 block font-semibold text-foreground hover:text-primary">
                          {it.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 font-medium">{it.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t pt-5">
                <p className="mb-3 text-sm font-semibold">Kết nối qua mạng xã hội</p>
                <SocialLinks facebook={s.facebook} youtube={s.youtube} tiktok={s.tiktok} zalo={s.zalo ? zaloHref(s.zalo) : null} messenger={s.messenger} itemClassName="bg-brand-light text-primary" />
              </div>
            </div>

            {s.zalo && (
              <a
                href={zaloHref(s.zalo)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-[#0068ff] p-5 text-white transition-opacity hover:opacity-90"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-base font-extrabold text-[#0068ff]">Zalo</span>
                <span>
                  <span className="block text-xs text-white/80">Nhắn tin Zalo nhanh</span>
                  <span className="block text-lg font-bold">{s.zalo}</span>
                </span>
              </a>
            )}
          </div>

          {/* Form liên hệ */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8 lg:col-span-3">
            <LeadForm type="CONTACT" title="Gửi lời nhắn cho chúng tôi" description="Điền thông tin bên dưới, chúng tôi sẽ phản hồi qua điện thoại hoặc email trong giờ làm việc." />
          </div>
        </div>
      </section>

      {s.mapEmbedUrl && (
        <section className="bg-muted py-14 md:py-20">
          <div className="container-page">
            <h2 className="mb-6 text-2xl font-bold text-brand-dark md:text-3xl">Bản đồ đường đi</h2>
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <iframe
                src={s.mapEmbedUrl}
                title={`Bản đồ ${s.companyName}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-[320px] w-full border-0 md:h-[440px]"
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
