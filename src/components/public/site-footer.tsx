import Link from "next/link";
import { BadgeCheck, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { PUBLIC_NAV } from "@/lib/constants";
import { telHref, zaloHref } from "@/lib/format";
import { getSettings } from "@/lib/queries/settings";
import { getMarketLinks } from "@/lib/queries/markets";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/public/brand-logo";
import { SocialLinks } from "@/components/public/social-icons";
import { CountryFlag } from "@/components/public/country-flag";

/** Footer trang công khai */
export async function SiteFooter() {
  const [s, markets] = await Promise.all([getSettings(), getMarketLinks()]);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        {/* Thông tin công ty */}
        <div className="lg:col-span-5">
          <div className="inline-block rounded-xl bg-white px-3 py-2">
            <BrandLogo logo={s.logo} companyName={s.companyName} shortName={s.shortName} showName={false} />
          </div>
          <p className="mt-4 text-lg font-bold text-white">{s.companyName}</p>
          {s.slogan && <p className="mt-1 text-sm italic text-amber-300">{s.slogan}</p>}
          <ul className="mt-5 space-y-3 text-sm">
            {s.licenseNumber && (
              <li className="flex gap-2.5">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>
                  Giấy phép số <strong className="text-white">{s.licenseNumber}</strong>
                  {s.licenseIssuer && <> do {s.licenseIssuer} cấp</>}
                </span>
              </li>
            )}
            {s.address && (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>{s.address}</span>
              </li>
            )}
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <a href={telHref(s.hotline)} className="font-semibold text-white hover:text-amber-300">
                Hotline: {s.hotline}
              </a>
            </li>
            {s.email && (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <a href={`mailto:${s.email}`} className="hover:text-white">
                  {s.email}
                </a>
              </li>
            )}
            {s.workingHours && (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>{s.workingHours}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Liên kết nhanh */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Liên kết nhanh</h3>
          <ul className="space-y-2.5 text-sm">
            {PUBLIC_NAV.filter((n) => n.href !== "/").map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="inline-block py-0.5 transition-colors hover:text-amber-300">
                  {n.label}
                </Link>
              </li>
            ))}
            {/* Hỏi đáp không nằm trong menu chính nhưng vẫn giữ ở footer */}
            <li>
              <Link href="/cau-hoi-thuong-gap" className="inline-block py-0.5 transition-colors hover:text-amber-300">
                Hỏi đáp
              </Link>
            </li>
            <li>
              <Link href="/dang-ky-tu-van" className="inline-block py-0.5 transition-colors hover:text-amber-300">
                Đăng ký tư vấn
              </Link>
            </li>
          </ul>
        </div>

        {/* Thị trường */}
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Thị trường</h3>
          <ul className="space-y-2.5 text-sm">
            {markets.map((m) => (
              <li key={m.slug}>
                <Link href={`/thi-truong/${m.slug}`} className="inline-flex items-center gap-2 py-0.5 transition-colors hover:text-amber-300">
                  <CountryFlag code={m.countryCode} className="text-base" />
                  <span className="line-clamp-1">{m.name}</span>
                </Link>
              </li>
            ))}
            {markets.length === 0 && <li className="text-white/60">Đang cập nhật</li>}
          </ul>
        </div>

        {/* Kết nối */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Kết nối với chúng tôi</h3>
          <p className="text-sm leading-relaxed">Để lại thông tin, tư vấn viên sẽ gọi lại cho bạn trong 24 giờ. Hoàn toàn miễn phí.</p>
          <Button asChild size="lg" className="mt-4 h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
            <Link href="/dang-ky-tu-van">
              <Send className="size-4" /> Đăng ký tư vấn miễn phí
            </Link>
          </Button>
          <SocialLinks
            facebook={s.facebook}
            youtube={s.youtube}
            tiktok={s.tiktok}
            zalo={s.zalo ? zaloHref(s.zalo) : null}
            messenger={s.messenger}
            className="mt-5"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/60 sm:flex-row">
          <p>
            © {year} {s.companyName}. Bảo lưu mọi quyền.
          </p>
          {s.taxCode && <p>Mã số thuế: {s.taxCode}</p>}
        </div>
      </div>
    </footer>
  );
}
