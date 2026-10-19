import Link from "next/link";
import { Phone, Send } from "lucide-react";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";

type CtaSectionProps = {
  hotline: string;
  title?: string;
  description?: string;
};

/** Dải kêu gọi hành động: đăng ký tư vấn + gọi hotline */
export function CtaSection({ hotline, title = "Sẵn sàng cho hành trình mới?", description = "Để lại thông tin để được tư vấn miễn phí về đơn hàng, chi phí và lộ trình phù hợp với bạn." }: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden bg-primary py-12 text-primary-foreground md:py-16">
      <div className="absolute -right-10 -top-10 size-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-16 left-10 size-64 rounded-full bg-cta/30 blur-3xl" aria-hidden="true" />
      <div className="container-page relative flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="mt-2 text-primary-foreground/85 md:text-lg">{description}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="h-12 bg-cta px-6 text-base font-semibold text-cta-foreground hover:bg-cta-hover">
            <Link href="/dang-ky-tu-van">
              <Send className="size-5" /> Đăng ký tư vấn
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 border-white/70 bg-transparent px-6 text-base font-semibold text-white hover:bg-white hover:text-primary">
            <a href={telHref(hotline)}>
              <Phone className="size-5" /> {hotline}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
