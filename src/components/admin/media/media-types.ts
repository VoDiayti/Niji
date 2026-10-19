import type { Media } from "@/generated/prisma/client";

/** Số ảnh mỗi trang trong thư viện ảnh */
export const MEDIA_PAGE_SIZE = 40;

/** Bản ghi ảnh đã chuyển sang dạng thuần (serializable) để truyền cho client component */
export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  /** ISO string */
  createdAt: string;
  uploadedBy: string | null;
};

export function toMediaItem(m: Media & { uploadedBy: { name: string } | null }): MediaItem {
  return {
    id: m.id,
    url: m.url,
    filename: m.filename,
    mimeType: m.mimeType,
    size: m.size,
    width: m.width,
    height: m.height,
    alt: m.alt,
    createdAt: m.createdAt.toISOString(),
    uploadedBy: m.uploadedBy?.name ?? null,
  };
}

/** 123456 → "120,6 KB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0).replace(".", ",")} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 2 : 1).replace(".", ",")} MB`;
}

/** Tên loại ảnh ngắn gọn: "image/webp" → "WEBP" */
export function mimeLabel(mimeType: string): string {
  const sub = mimeType.split("/")[1] ?? mimeType;
  return sub.replace("+xml", "").toUpperCase();
}
