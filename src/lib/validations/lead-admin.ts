import { z } from "zod";
import { and, eq, like, or, type SQL } from "drizzle-orm";
import { leads } from "@/db/schema";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "PASSED", "CANCELLED"] as const;
export const LEAD_TYPES = ["CONSULTATION", "APPLICATION", "CONTACT"] as const;

/** Đổi trạng thái xử lý đăng ký */
export const leadStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES, "Trạng thái không hợp lệ"),
});

/** Ghi chú nội bộ của tư vấn viên */
export const leadNoteSchema = z.object({
  id: z.string().min(1),
  adminNote: z.string().trim().max(2000, "Ghi chú tối đa 2000 ký tự").optional(),
});

/**
 * Bộ lọc danh sách đăng ký (đọc từ searchParams / query string).
 * Dùng chung cho trang /admin/dang-ky và route xuất CSV để kết quả luôn khớp nhau.
 */
export const leadFilterSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(LEAD_STATUSES).optional().catch(undefined),
  type: z.enum(LEAD_TYPES).optional().catch(undefined),
  market: z.string().trim().max(50).optional().catch(undefined),
  job: z.string().trim().max(50).optional().catch(undefined),
});
export type LeadFilter = z.output<typeof leadFilterSchema>;

/** Chuyển giá trị searchParams (string | string[] | undefined) về string */
function first(v: unknown): string | undefined {
  if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : undefined;
  return typeof v === "string" ? v : undefined;
}

/** Đọc bộ lọc từ object searchParams hoặc URLSearchParams */
export function parseLeadFilter(source: Record<string, unknown> | URLSearchParams): LeadFilter {
  const get = (key: string) => (source instanceof URLSearchParams ? source.get(key) ?? undefined : first(source[key]));
  return leadFilterSchema.parse({ q: get("q"), status: get("status"), type: get("type"), market: get("market"), job: get("job") });
}

/**
 * Điều kiện Drizzle tương ứng với bộ lọc (undefined = không lọc).
 * Dùng cho cả `db.query.leads.findMany({ where })` và `db.select().from(leads).where(...)`.
 */
export function leadFilterWhere(filter: LeadFilter): SQL | undefined {
  const q = filter.q;
  const digits = q ? q.replace(/\D/g, "") : "";
  return and(
    filter.status ? eq(leads.status, filter.status) : undefined,
    filter.type ? eq(leads.type, filter.type) : undefined,
    filter.market ? eq(leads.marketId, filter.market) : undefined,
    filter.job ? eq(leads.jobOrderId, filter.job) : undefined,
    q
      ? or(
          like(leads.fullName, `%${q}%`),
          like(leads.email, `%${q}%`),
          digits ? like(leads.phone, `%${digits}%`) : undefined
        )
      : undefined
  );
}
