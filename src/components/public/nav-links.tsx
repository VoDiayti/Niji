"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Menu điều hướng chính – tự đánh dấu mục đang mở */
export function NavLinks({
  orientation = "horizontal",
  onNavigate,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={cn(orientation === "horizontal" ? "flex items-center gap-1" : "flex flex-col", className)}>
      {PUBLIC_NAV.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                orientation === "horizontal"
                  ? "relative inline-flex h-10 items-center whitespace-nowrap rounded-md px-2.5 text-sm font-medium transition-colors hover:bg-brand-light hover:text-primary after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-cta after:opacity-0 after:transition-opacity 2xl:px-3 2xl:text-[15px]"
                  : "flex min-h-12 items-center justify-between rounded-lg px-3 text-base font-medium transition-colors hover:bg-brand-light hover:text-primary",
                active && (orientation === "horizontal" ? "text-primary after:opacity-100" : "bg-brand-light text-primary")
              )}
            >
              {item.label}
              {orientation === "vertical" && <ChevronRight className="size-4 text-muted-foreground" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
