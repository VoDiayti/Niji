"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { JobTableGroup } from "@/lib/queries/job-programs";

/** Bảng đơn hàng theo tab chương trình: Việc làm · Số lượng · Nơi làm việc · Mức lương · Ngày phỏng vấn */
export function JobTableTabs({ groups }: { groups: JobTableGroup[] }) {
  return (
    <Tabs defaultValue={groups[0].slug} className="gap-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto bg-brand-dark">
        <TabsList className="h-auto w-max min-w-full justify-start gap-0 rounded-none bg-transparent p-0">
          {groups.map((g) => (
            <TabsTrigger
              key={g.slug}
              value={g.slug}
              className="h-12 flex-none rounded-none border-0 px-4 text-xs font-semibold uppercase tracking-wide text-white/80 shadow-none hover:text-white data-[state=active]:bg-cta data-[state=active]:text-cta-foreground data-[state=active]:shadow-none md:px-6 md:text-sm"
            >
              {g.name}
              <span className="ml-1.5 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">{g.total}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {groups.map((g) => (
        <TabsContent key={g.slug} value={g.slug} className="mt-0">
          {/* Điện thoại: mỗi đơn hàng là một thẻ xếp dọc */}
          <ul className="divide-y md:hidden">
            {g.jobs.map((j) => (
              <li key={j.id}>
                <Link href={`/don-hang/${j.slug}`} className="block space-y-2 px-4 py-3 transition-colors active:bg-brand-light/60">
                  <p className="flex items-start gap-1.5 font-semibold uppercase leading-snug">
                    {j.isFeatured && <Star className="mt-0.5 size-3.5 shrink-0 fill-cta text-cta" aria-label="Nổi bật" />}
                    <span>{j.title}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Số lượng</span>
                    <span className="font-semibold tabular-nums">{j.quantity}</span>
                    <span className="text-muted-foreground">Nơi làm việc</span>
                    <span className="uppercase">{j.location ?? "—"}</span>
                    <span className="text-muted-foreground">Mức lương</span>
                    <span className="font-semibold text-red-600">{j.salaryText ?? "Thỏa thuận"}</span>
                    <span className="text-muted-foreground">Phỏng vấn (dự kiến)</span>
                    <span className="font-medium text-red-600 tabular-nums">{j.interviewDate ?? "Liên hệ"}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {/* Tablet/desktop: bảng đầy đủ */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 md:px-5">Việc làm</th>
                  <th className="px-3 py-3 text-center">Số lượng</th>
                  <th className="px-3 py-3 text-center">Nơi làm việc</th>
                  <th className="px-3 py-3 text-center">Mức lương</th>
                  <th className="px-3 py-3 text-center">Ngày phỏng vấn (dự kiến)</th>
                </tr>
              </thead>
              <tbody>
                {g.jobs.map((j) => (
                  <tr key={j.id} className="border-t transition-colors hover:bg-brand-light/50">
                    <td className="px-4 py-3 md:px-5">
                      <Link href={`/don-hang/${j.slug}`} className="inline-flex items-start gap-1.5 font-semibold uppercase leading-snug text-foreground hover:text-primary">
                        {j.isFeatured && <Star className="mt-0.5 size-3.5 shrink-0 fill-cta text-cta" aria-label="Nổi bật" />}
                        <span>{j.title}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold tabular-nums">{j.quantity}</td>
                    <td className="px-3 py-3 text-center uppercase">{j.location ?? "—"}</td>
                    <td className="px-3 py-3 text-center font-semibold text-red-600">{j.salaryText ?? "Thỏa thuận"}</td>
                    <td className="px-3 py-3 text-center font-medium text-red-600 tabular-nums">{j.interviewDate ?? "Liên hệ"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-start gap-2 border-t bg-muted/30 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-5">
            <span>{g.description ?? `${g.total} đơn hàng đang tuyển`}</span>
            <Button asChild variant="link" className="h-auto px-0 font-semibold">
              <Link href={`/don-hang?chuong-trinh=${g.slug}`}>
                Xem tất cả đơn {g.name} <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
