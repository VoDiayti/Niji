"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";

/** Phân trang giữ nguyên các tham số lọc hiện tại trên URL (tham số trang: `page`) */
export function ListPagination({ page, totalPages, className }: { page: number; totalPages: number; className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // Hiển thị tối đa 7 ô: 1 … (page-1) page (page+1) … last
  const pages: (number | "ellipsis")[] = [];
  const push = (p: number | "ellipsis") => pages.push(p);
  if (totalPages <= 7) {
    for (let p = 1; p <= totalPages; p++) push(p);
  } else {
    push(1);
    if (page > 3) push("ellipsis");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) push(p);
    if (page < totalPages - 2) push("ellipsis");
    push(totalPages);
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={href(Math.max(1, page - 1))} aria-disabled={page <= 1} className={page <= 1 ? "pointer-events-none opacity-50" : ""} />
        </PaginationItem>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href={href(p)} isActive={p === page}>{p}</PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext href={href(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages} className={page >= totalPages ? "pointer-events-none opacity-50" : ""} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
