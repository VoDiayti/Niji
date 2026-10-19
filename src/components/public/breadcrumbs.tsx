import { Fragment } from "react";
import Link from "next/link";
import { House } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/public/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** Đường dẫn điều hướng + JSON-LD BreadcrumbList. Mục cuối là trang hiện tại. */
export function Breadcrumbs({ items, className, tone = "default" }: { items: Crumb[]; className?: string; tone?: "default" | "light" }) {
  const all: Crumb[] = [{ label: "Trang chủ", href: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(all.map((c) => ({ name: c.label, path: c.href })))} />
      <Breadcrumb className={className}>
        <BreadcrumbList className={cn(tone === "light" && "text-white/70 [&_a:hover]:text-white [&_[data-slot=breadcrumb-page]]:text-white")}>
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <Fragment key={`${item.label}-${i}`}>
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem className={cn(i === 0 && "max-sm:[&_span]:sr-only")}>
                  {last || !item.href ? (
                    <BreadcrumbPage className="line-clamp-1 max-w-[16rem] sm:max-w-md">{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="inline-flex items-center gap-1">
                        {i === 0 && <House className="size-3.5" />}
                        <span>{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
