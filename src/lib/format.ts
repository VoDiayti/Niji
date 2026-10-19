import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function formatDate(date: Date | string | null | undefined, pattern = "dd/MM/yyyy"): string {
  if (!date) return "";
  return format(new Date(date), pattern, { locale: vi });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "HH:mm dd/MM/yyyy");
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
}

/** 28000000 → "28 triệu" ; 28500000 → "28,5 triệu" */
export function formatVndMillions(vnd: number | null | undefined): string {
  if (!vnd) return "";
  const m = vnd / 1_000_000;
  return `${Number.isInteger(m) ? m : m.toFixed(1).replace(".", ",")} triệu`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "";
  return new Intl.NumberFormat("vi-VN").format(n);
}

/** Rút gọn văn bản thuần (dùng cho mô tả ngắn / meta description) */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** Chuẩn hóa số điện thoại Việt Nam về dạng 0xxxxxxxxx */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits;
}

/** Link gọi điện: "0912 345 678" → "tel:0912345678" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Link Zalo: số điện thoại → https://zalo.me/0912345678 */
export function zaloHref(phone: string): string {
  return `https://zalo.me/${phone.replace(/\D/g, "")}`;
}

/** Đọc mảng chuỗi lưu dạng JSON trong SQLite (vd industries, highlights của thị trường) */
export function parseStringList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return value.split("\n").map((v) => v.trim()).filter(Boolean);
  }
}
