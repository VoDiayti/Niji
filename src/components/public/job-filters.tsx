"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Funnel, Search, X } from "lucide-react";
import { AGE_RANGES, GENDER_LABELS, SALARY_RANGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "__all__";

export const JOB_FILTER_KEYS = ["chuong-trinh", "thi-truong", "nganh", "gioi-tinh", "tuoi", "luong", "q"] as const;

type JobFiltersProps = {
  markets: { slug: string; name: string }[];
  industries: string[];
  /** Chương trình (tab bảng đơn hàng) – tùy chọn */
  programs?: { slug: string; name: string }[];
};

function useSetParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page"); // đổi bộ lọc → về trang 1
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

function FilterSelect({
  param,
  label,
  options,
  allLabel,
}: {
  param: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  const searchParams = useSearchParams();
  const setParams = useSetParam();
  const current = searchParams.get(param) ?? ALL;
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={options.some((o) => o.value === current) ? current : ALL} onValueChange={(v) => setParams({ [param]: v === ALL ? null : v })}>
        <SelectTrigger className="w-full bg-background data-[size=default]:h-11 md:data-[size=default]:h-10" aria-label={label}>
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Bộ lọc đơn hàng – cập nhật trực tiếp lên URL để chia sẻ/đánh dấu được */
export function JobFilters({ markets, industries, programs = [] }: JobFiltersProps) {
  const searchParams = useSearchParams();
  const setParams = useSetParam();
  const urlQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  // Giá trị q gần nhất đã đẩy lên URL – để phân biệt thay đổi do người dùng gõ với thay đổi từ ngoài (back/forward, nút xóa lọc)
  const [lastPushed, setLastPushed] = useState(urlQ);
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    if (urlQ !== lastPushed) {
      setQ(urlQ);
      setLastPushed(urlQ);
    }
  }

  // Gõ xong 450ms mới cập nhật URL
  useEffect(() => {
    const value = q.trim();
    if (value === lastPushed) return;
    const t = setTimeout(() => {
      setLastPushed(value);
      setParams({ q: value || null });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeCount = JOB_FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 font-semibold">
          <Funnel className="size-4 text-primary" /> Lọc đơn hàng
          {activeCount > 0 && <span className="rounded-full bg-cta px-2 py-0.5 text-xs font-bold text-cta-foreground">{activeCount}</span>}
        </p>
        {activeCount > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setParams(Object.fromEntries(JOB_FILTER_KEYS.map((k) => [k, null])))}>
            <X className="size-4" /> Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="grid gap-1.5 sm:col-span-2 lg:col-span-6">
          <label htmlFor="job-search" className="text-xs font-medium text-muted-foreground">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="job-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tên đơn hàng, ngành nghề, địa điểm..."
              className="h-11 bg-background pl-9 pr-9 md:h-10"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
        {programs.length > 0 && (
          <div className="lg:col-span-2">
            <FilterSelect param="chuong-trinh" label="Chương trình" allLabel="Tất cả chương trình" options={programs.map((p) => ({ value: p.slug, label: p.name }))} />
          </div>
        )}
        <div className="lg:col-span-2">
          <FilterSelect param="thi-truong" label="Thị trường" allLabel="Tất cả thị trường" options={markets.map((m) => ({ value: m.slug, label: m.name }))} />
        </div>
        <div className="lg:col-span-2">
          <FilterSelect param="nganh" label="Ngành nghề" allLabel="Tất cả ngành nghề" options={industries.map((i) => ({ value: i, label: i }))} />
        </div>
        <div className="lg:col-span-2">
          <FilterSelect
            param="gioi-tinh"
            label="Giới tính"
            allLabel="Nam / Nữ"
            options={[
              { value: "MALE", label: GENDER_LABELS.MALE },
              { value: "FEMALE", label: GENDER_LABELS.FEMALE },
            ]}
          />
        </div>
        <div className="lg:col-span-3">
          <FilterSelect param="tuoi" label="Độ tuổi" allLabel="Mọi độ tuổi" options={AGE_RANGES.map((r) => ({ value: r.value, label: r.label }))} />
        </div>
        <div className="lg:col-span-3">
          <FilterSelect param="luong" label="Mức lương (VNĐ/tháng)" allLabel="Mọi mức lương" options={SALARY_RANGES.map((r) => ({ value: r.value, label: r.label }))} />
        </div>
      </div>
    </div>
  );
}
