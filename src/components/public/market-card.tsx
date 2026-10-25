import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, Clock } from "lucide-react";
import type { Market } from "@/db/types";
import { CountryFlag } from "@/components/public/country-flag";
import { cn } from "@/lib/utils";
import { parseStringList } from "@/lib/format";

type MarketCardData = Pick<Market, "name" | "slug" | "countryCode" | "image" | "summary" | "salaryRange" | "duration" | "industries">;

/** Card thị trường: ảnh, cờ, tên, tóm tắt, lương, thời gian */
export function MarketCard({ market, className, priority }: { market: MarketCardData; className?: string; priority?: boolean }) {
  return (
    <Link
      href={`/thi-truong/${market.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {market.image ? (
          <Image
            src={market.image}
            alt={market.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
          <h3 className="flex items-center gap-2 text-xl font-bold text-white">
            <CountryFlag code={market.countryCode} className="text-2xl" />
            {market.name}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {market.summary && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{market.summary}</p>}
        <ul className="mt-4 space-y-2 text-sm">
          {market.salaryRange && (
            <li className="flex gap-2">
              <Banknote className="mt-0.5 size-4 shrink-0 text-cta" />
              <span>
                <span className="text-muted-foreground">Thu nhập: </span>
                <span className="font-semibold text-foreground">{market.salaryRange}</span>
              </span>
            </li>
          )}
          {market.duration && (
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="text-muted-foreground">Hợp đồng: </span>
                <span className="font-medium">{market.duration}</span>
              </span>
            </li>
          )}
        </ul>
        {parseStringList(market.industries).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {parseStringList(market.industries).slice(0, 3).map((ind) => (
              <span key={ind} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-primary">
                {ind}
              </span>
            ))}
            {parseStringList(market.industries).length > 3 && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">+{parseStringList(market.industries).length - 3}</span>}
          </div>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary group-hover:gap-2">
          Xem chi tiết <ArrowRight className="size-4 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
