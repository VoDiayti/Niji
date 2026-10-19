"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { formatBytes, type MediaItem } from "@/components/admin/media/media-types";
import { MediaDetailDialog } from "@/components/admin/media/media-detail-dialog";

/** Lưới ảnh thư viện; bấm vào ảnh để mở hộp thoại chi tiết */
export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((m) => m.id === selectedId) ?? null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-16 text-center">
        <Images className="size-10 text-muted-foreground/60" />
        <p className="font-medium">Chưa có ảnh nào</p>
        <p className="max-w-sm text-sm text-muted-foreground">Bấm &quot;Tải ảnh lên&quot; để thêm ảnh vào thư viện. Ảnh chèn trong bài viết cũng sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedId(m.id)}
            className="group overflow-hidden rounded-lg border bg-background text-left shadow-xs transition-shadow outline-none hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50"
            aria-label={`Xem chi tiết ảnh ${m.filename}`}
          >
            <div className="aspect-square overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh upload bất kỳ trong admin */}
              <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-2">
              <p className="truncate text-xs font-medium" title={m.filename}>{m.filename}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {m.width && m.height ? `${m.width}×${m.height} · ` : ""}{formatBytes(m.size)}
              </p>
            </div>
          </button>
        ))}
      </div>
      <MediaDetailDialog item={selected} onOpenChange={(open) => !open && setSelectedId(null)} />
    </>
  );
}
