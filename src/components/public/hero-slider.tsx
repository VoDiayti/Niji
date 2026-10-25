"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import type { Banner } from "@/db/types";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BannerData = Pick<Banner, "id" | "title" | "subtitle" | "image" | "ctaText" | "ctaLink" | "ctaText2" | "ctaLink2">;

type HeroSliderProps = {
  banners: BannerData[];
  hotline: string;
  /** Thời gian tự chuyển slide (ms) */
  interval?: number;
};

/** Banner trang chủ – tự làm slider đơn giản (không dùng thư viện ngoài) */
export function HeroSlider({ banners, hotline, interval = 6500 }: HeroSliderProps) {
  const count = banners.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(t);
  }, [count, paused, interval]);

  if (count === 0) return null;

  return (
    <section
      className="relative isolate h-[34rem] overflow-hidden bg-brand-dark text-white sm:h-[36rem] lg:h-[40rem]"
      aria-roledescription="carousel"
      aria-label="Banner giới thiệu"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? index + 1 : index - 1);
        touchStartX.current = null;
      }}
    >
      {banners.map((b, i) => {
        const active = i === index;
        const Heading = i === 0 ? "h1" : "h2";
        return (
          <div
            key={b.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={!active}
            className={cn("absolute inset-0 transition-opacity duration-700 ease-out", active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0")}
          >
            <Image src={b.image} alt={b.title} fill priority={i === 0} sizes="100vw" quality={75} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/75 to-brand-dark/25" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-dark/80 to-transparent" />

            <div className="container-page relative flex h-full items-center pb-24 pt-6 md:pb-28">
              <div className={cn("max-w-2xl md:pl-12", active && "animate-fade-up")}>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200 backdrop-blur">
                  Xuất khẩu lao động uy tín
                </p>
                <Heading className="text-3xl font-extrabold leading-[1.15] drop-shadow sm:text-4xl lg:text-5xl xl:text-[3.4rem]">{b.title}</Heading>
                {b.subtitle && <p className="mt-4 line-clamp-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">{b.subtitle}</p>}
                <div className="mt-7 flex flex-wrap gap-3">
                  {b.ctaText && b.ctaLink && (
                    <Button asChild size="lg" className="h-12 bg-cta px-6 text-base font-semibold text-cta-foreground shadow-lg shadow-cta/30 hover:bg-cta-hover">
                      <Link href={b.ctaLink}>
                        {b.ctaText} <ArrowRight className="size-5" />
                      </Link>
                    </Button>
                  )}
                  {b.ctaText2 && b.ctaLink2 && (
                    <Button asChild size="lg" variant="outline" className="h-12 border-white/60 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur hover:bg-white hover:text-brand-dark">
                      <Link href={b.ctaLink2}>{b.ctaText2}</Link>
                    </Button>
                  )}
                </div>
                <a href={telHref(hotline)} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white">
                  <Phone className="size-4 text-amber-300" /> Hotline tư vấn miễn phí: <span className="font-bold text-amber-300">{hotline}</span>
                </a>
              </div>
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <>
          <div className="absolute inset-x-0 bottom-16 z-20 flex items-center justify-center gap-2 md:bottom-[4.5rem]">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Chuyển tới banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={cn("h-2.5 rounded-full transition-all", i === index ? "w-8 bg-cta" : "w-2.5 bg-white/50 hover:bg-white/80")}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Banner trước"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-dark md:flex lg:left-6"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Banner tiếp theo"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white hover:text-brand-dark md:flex lg:right-6"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}
    </section>
  );
}
