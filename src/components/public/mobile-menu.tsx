"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, Send } from "lucide-react";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NavLinks } from "@/components/public/nav-links";
import { BrandLogo } from "@/components/public/brand-logo";
import { SocialLinks, type SocialLinksProps } from "@/components/public/social-icons";

type MobileMenuProps = {
  logo?: string | null;
  companyName: string;
  shortName?: string | null;
  hotline: string;
  social: Omit<SocialLinksProps, "className" | "itemClassName">;
};

/** Menu di động dạng Sheet trượt từ phải */
export function MobileMenu({ logo, companyName, shortName, hotline, social }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-lg" className="shrink-0 xl:hidden" aria-label="Mở menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[88vw] max-w-sm gap-0 overflow-y-auto p-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Điều hướng website {shortName || companyName}</SheetDescription>
        <div className="border-b px-4 py-4">
          <BrandLogo logo={logo} companyName={companyName} shortName={shortName} showName={false} onClick={close} />
        </div>
        <nav aria-label="Menu chính" className="px-2 py-3">
          <NavLinks orientation="vertical" onNavigate={close} className="gap-0.5" />
        </nav>
        <Separator />
        <div className="space-y-3 px-4 py-4">
          <Button asChild size="lg" className="h-12 w-full text-base">
            <a href={telHref(hotline)}>
              <Phone className="size-5" /> Gọi {hotline}
            </a>
          </Button>
          <Button asChild size="lg" className="h-12 w-full bg-cta text-base text-cta-foreground hover:bg-cta-hover">
            <Link href="/dang-ky-tu-van" onClick={close}>
              <Send className="size-5" /> Đăng ký tư vấn
            </Link>
          </Button>
          <SocialLinks {...social} className="justify-center pt-1" itemClassName="bg-brand-light text-primary" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
