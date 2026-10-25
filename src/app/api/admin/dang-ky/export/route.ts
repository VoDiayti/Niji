import { desc } from "drizzle-orm";
import { db, leads } from "@/db";
import { getSessionUser } from "@/lib/auth-guard";
import { LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import { leadFilterWhere, parseLeadFilter } from "@/lib/validations/lead-admin";

/** Escape một ô CSV: bọc trong dấu nháy kép, nhân đôi dấu nháy bên trong */
function csvCell(value: string | number | null | undefined): string {
  if (value == null) return '""';
  const s = String(value).replace(/\r?\n/g, "\n");
  return `"${s.replace(/"/g, '""')}"`;
}

const HEADER = ["Thời gian", "Loại", "Họ tên", "Điện thoại", "Email", "Năm sinh", "Quê quán", "Thị trường", "Đơn hàng", "Ghi chú khách", "Trạng thái", "Ghi chú nội bộ", "Nguồn"];

/**
 * GET /api/admin/dang-ky/export?q=&status=&type=&market=&job=
 * Xuất danh sách đăng ký (theo cùng bộ lọc của trang /admin/dang-ky) ra CSV UTF-8 có BOM để Excel mở đúng tiếng Việt.
 */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new Response("Bạn cần đăng nhập.", { status: 401 });

  const { searchParams } = new URL(request.url);
  const where = leadFilterWhere(parseLeadFilter(searchParams));

  const items = await db.query.leads.findMany({
    where,
    orderBy: [desc(leads.createdAt)],
    with: { market: { columns: { name: true } }, jobOrder: { columns: { title: true } } },
  });

  const rows = items.map((lead) =>
    [
      formatDateTime(lead.createdAt),
      LEAD_TYPE_LABELS[lead.type],
      lead.fullName,
      lead.phone,
      lead.email,
      lead.birthYear,
      lead.hometown,
      lead.market?.name,
      lead.jobOrder?.title,
      lead.message,
      LEAD_STATUS_LABELS[lead.status],
      lead.adminNote,
      lead.source,
    ]
      .map(csvCell)
      .join(",")
  );

  const BOM = "﻿";
  const csv = BOM + [HEADER.map(csvCell).join(","), ...rows].join("\r\n") + "\r\n";
  const filename = `dang-ky-${formatDate(new Date(), "yyyy-MM-dd")}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
