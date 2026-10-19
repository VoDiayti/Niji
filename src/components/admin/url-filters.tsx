"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function useUrlParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // đổi bộ lọc → về trang 1
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };
}

/** Ô tìm kiếm cập nhật tham số `q` trên URL (debounce 400ms) */
export function SearchInput({ placeholder = "Tìm kiếm...", param = "q", className }: { placeholder?: string; param?: string; className?: string }) {
  const searchParams = useSearchParams();
  const setParam = useUrlParam();
  const initial = searchParams.get(param) ?? "";
  const [value, setValue] = useState(initial);
  // Đồng bộ khi URL đổi từ bên ngoài (vd: nút xóa bộ lọc) – pattern "điều chỉnh state khi render"
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setValue(initial);
  }

  useEffect(() => {
    if (value === initial) return;
    const t = setTimeout(() => setParam(param, value.trim() || null), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="pl-8 pr-8" />
      {value && (
        <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => setValue("")} aria-label="Xóa tìm kiếm">
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

const ALL = "__all__";

/** Select cập nhật một tham số lọc trên URL */
export function UrlParamSelect({
  param, options, placeholder = "Tất cả", allLabel = "Tất cả", className,
}: { param: string; options: { value: string; label: string }[]; placeholder?: string; allLabel?: string; className?: string }) {
  const searchParams = useSearchParams();
  const setParam = useUrlParam();
  const current = searchParams.get(param) ?? ALL;
  return (
    <Select value={current} onValueChange={(v) => setParam(param, v === ALL ? null : v)}>
      <SelectTrigger className={className ?? "w-full sm:w-44"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
