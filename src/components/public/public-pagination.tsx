import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PublicPaginationProps = {
  page: number;
  totalPages: number;
  /** Đường dẫn gốc, vd "/don-hang" */
  pathname: string;
  /** Các tham số lọc hiện tại cần giữ lại */
  query?: Record<string, string | undefined>;
  className?: string;
};

/** Phân trang (server component) – giữ nguyên bộ lọc trên URL, tham số trang `page` */
export function PublicPagination({ page, totalPages, pathname, query = {}, className }: PublicPaginationProps) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) if (v) params.set(k, v);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let p = 1; p <= totalPages; p++) pages.push(p);
  } else {
    pages.push(1);
    if (page > 3) pages.push("ellipsis");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
  }

  const navClass = cn(buttonVariants({ variant: "outline", size: "default" }), "h-10 gap-1 px-3");

  return (
    <nav role="navigation" aria-label="Phân trang" className={cn("flex items-center justify-center gap-1.5", className)}>
      {page > 1 ? (
        <Link href={href(page - 1)} className={navClass} aria-label="Trang trước">
          <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Trước</span>
        </Link>
      ) : (
        <span className={cn(navClass, "pointer-events-none opacity-50")} aria-disabled="true">
          <ChevronLeft className="size-4" /> <span className="hidden sm:inline">Trước</span>
        </span>
      )}
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="flex size-10 items-center justify-center text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(buttonVariants({ variant: p === page ? "default" : "ghost", size: "icon" }), "size-10", p === page && "pointer-events-none")}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={href(page + 1)} className={navClass} aria-label="Trang sau">
          <span className="hidden sm:inline">Sau</span> <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(navClass, "pointer-events-none opacity-50")} aria-disabled="true">
          <span className="hidden sm:inline">Sau</span> <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
