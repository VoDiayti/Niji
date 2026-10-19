import Image from "next/image";
import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/generated/prisma/client";
import { SectionHeading } from "@/components/public/section-heading";
import { cn } from "@/lib/utils";

type TestimonialData = Pick<Testimonial, "id" | "name" | "position" | "content" | "avatar" | "rating">;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function TestimonialCard({ t, className }: { t: TestimonialData; className?: string }) {
  return (
    <figure className={cn("flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm", className)}>
      <Quote className="size-8 text-cta/40" aria-hidden="true" />
      <div className="mt-2 flex gap-0.5" aria-label={`${t.rating} trên 5 sao`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn("size-4", i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
        ))}
      </div>
      <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/90">“{t.content}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
        {t.avatar ? (
          <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
            <Image src={t.avatar} alt={t.name} fill sizes="48px" className="object-cover" />
          </span>
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{initials(t.name)}</span>
        )}
        <div className="min-w-0">
          <p className="font-semibold">{t.name}</p>
          {t.position && <p className="line-clamp-2 text-xs text-muted-foreground">{t.position}</p>}
        </div>
      </figcaption>
    </figure>
  );
}

/** Cảm nhận của học viên / người lao động */
export function TestimonialsSection({ testimonials }: { testimonials: TestimonialData[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-brand-light py-14 md:py-20">
      <div className="container-page">
        <SectionHeading
          label="Cảm nhận"
          title="Người lao động nói gì về chúng tôi"
          description="Hàng nghìn lao động và thực tập sinh đã thay đổi cuộc sống gia đình sau khi đồng hành cùng công ty."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
