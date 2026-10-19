"use client";

import { useCallback, useEffect, useState } from "react";
import { Images, LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { searchMedia } from "@/actions/media";
import { formatBytes, type MediaItem } from "@/components/admin/media/media-types";
import { MediaUploadButton } from "@/components/admin/media/media-upload-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Gọi khi người dùng chọn một ảnh (đường dẫn + bản ghi ảnh) */
  onSelect: (url: string, item: MediaItem) => void;
};

/** Hộp thoại chọn ảnh có sẵn trong thư viện (tìm kiếm, tải thêm, tải ảnh mới) */
export function MediaPickerDialog({ open, onOpenChange, onSelect }: MediaPickerDialogProps) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (nextPage: number, query: string, append: boolean) => {
    setLoading(true);
    const result = await searchMedia({ q: query, page: nextPage });
    if (result.success && result.data) {
      const data = result.data;
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setTotal(data.total);
      setPage(data.page);
    } else if (!result.success) {
      toast.error(result.message);
    }
    setLoading(false);
  }, []);

  // Tải danh sách khi mở hộp thoại hoặc đổi từ khóa (debounce)
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => void load(1, q, false), q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [open, q, load]);

  const hasMore = items.length < total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chọn ảnh từ thư viện</DialogTitle>
          <DialogDescription>Bấm vào ảnh để sử dụng. Ảnh mới nhất hiển thị trước.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên file hoặc mô tả..." className="pl-8" />
          </div>
          <MediaUploadButton variant="secondary" refreshOnDone={false} onUploaded={() => void load(1, q, false)} />
        </div>

        <div className="min-h-48 flex-1 overflow-y-auto rounded-md border p-2">
          {items.length === 0 && !loading ? (
            <div className="flex h-full min-h-44 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Images className="size-8 opacity-50" />
              {q ? "Không tìm thấy ảnh phù hợp." : "Thư viện chưa có ảnh nào."}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelect(m.url, m);
                    onOpenChange(false);
                  }}
                  className="group overflow-hidden rounded-md border bg-background text-left outline-none transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  title={`${m.filename}${m.width && m.height ? ` – ${m.width}×${m.height}` : ""} – ${formatBytes(m.size)}`}
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- ảnh upload bất kỳ trong admin */}
                    <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <p className="truncate px-1.5 py-1 text-[11px]">{m.filename}</p>
                </button>
              ))}
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Đang tải...
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{total > 0 ? `Hiển thị ${items.length}/${total} ảnh` : ""}</span>
          {hasMore && (
            <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => void load(page + 1, q, true)}>
              Tải thêm
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
