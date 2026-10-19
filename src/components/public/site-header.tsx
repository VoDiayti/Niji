import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { telHref, zaloHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/public/brand-logo";
import { NavLinks } from "@/components/public/nav-links";
import { MobileMenu } from "@/components/public/mobile-menu";
import { SocialLinks } from "@/components/public/social-icons";

/** Header trang công khai: thanh thông tin + logo, menu, hotline, CTA (sticky) */
export async function SiteHeader() {
  const s = await getSettings();
  const social = {
    facebook: s.facebook,
    youtube: s.youtube,
    tiktok: s.tiktok,
    zalo: s.zalo ? zaloHref(s.zalo) : null,
    messenger: s.messenger,
  };

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Thanh thông tin trên cùng – chỉ hiện trên màn hình lớn */}
      <div className="hidden bg-brand-dark text-xs text-white/85 md:block">
        <div className="container-page flex h-9 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            {s.address && (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0 text-amber-300" />
                <span className="truncate">{s.address}</span>
              </span>
            )}
            {s.workingHours && (
              <span className="hidden items-center gap-1.5 lg:inline-flex">
                <Clock className="size-3.5 shrink-0 text-amber-300" />
                {s.workingHours}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {s.email && (
              <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 hover:text-white">
                <Mail className="size-3.5 text-amber-300" />
                {s.email}
              </a>
            )}
            <SocialLinks {...social} className="gap-1" itemClassName="size-7 bg-transparent hover:bg-white/15 hover:text-white [&_svg]:size-4" />
          </div>
        </div>
      </div>

      {/* Thanh chính */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="container-page flex h-16 items-center justify-between gap-3 md:h-[4.5rem]">
          <BrandLogo logo={s.logo} companyName={s.companyName} shortName={s.shortName} />

          {/* Menu ngang chỉ hiện từ 1280px; dưới đó dùng menu di động để không bị tràn */}
          <nav aria-label="Menu chính" className="hidden xl:block">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-2">
            {/* Hotline */}
            <a
              href={telHref(s.hotline)}
              className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-primary/20 bg-brand-light py-1.5 pl-1.5 pr-4 text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:flex"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Phone className="size-4" />
              </span>
              <span className="leading-tight">
                <span className="hidden text-[10px] font-medium uppercase tracking-wide opacity-80 2xl:block">Hotline 24/7</span>
                <span className="block text-sm font-bold">{s.hotline}</span>
              </span>
            </a>
            {/* Gọi nhanh trên di động */}
            <Button asChild variant="outline" size="icon-lg" className="shrink-0 border-primary/30 text-primary md:hidden" aria-label={`Gọi ${s.hotline}`}>
              <a href={telHref(s.hotline)}>
                <Phone className="size-5" />
              </a>
            </Button>
            <Button asChild size="lg" className="hidden h-11 shrink-0 whitespace-nowrap bg-cta px-5 font-semibold text-cta-foreground hover:bg-cta-hover sm:inline-flex">
              <Link href="/dang-ky-tu-van">
                <Send className="size-4" /> Đăng ký tư vấn
              </Link>
            </Button>
            <MobileMenu logo={s.logo} companyName={s.companyName} shortName={s.shortName} hotline={s.hotline} social={social} />
          </div>
        </div>
      </div>
    </header>
  );
}
