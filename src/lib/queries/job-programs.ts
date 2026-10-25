import "server-only";
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { db, jobOrders, jobPrograms } from "@/db";
import { formatDate } from "@/lib/format";

/** Các chương trình (tab) đang hiển thị, theo thứ tự */
export async function getActiveJobPrograms() {
  return db.query.jobPrograms.findMany({
    where: eq(jobPrograms.isActive, true),
    orderBy: [asc(jobPrograms.order), asc(jobPrograms.name)],
    columns: { id: true, name: true, slug: true, description: true },
  });
}

export type JobTableRow = {
  id: string;
  title: string;
  slug: string;
  quantity: number;
  location: string | null;
  salaryText: string | null;
  /** Ngày phỏng vấn dự kiến đã định dạng dd/MM/yyyy, null nếu chưa có */
  interviewDate: string | null;
  isFeatured: boolean;
};

export type JobTableGroup = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  jobs: JobTableRow[];
  /** Tổng số đơn đang tuyển của chương trình (có thể lớn hơn số dòng hiển thị) */
  total: number;
};

/**
 * Dữ liệu cho bảng đơn hàng theo tab ở trang chủ: mỗi chương trình đang hiển thị kèm các đơn hàng OPEN của nó.
 * Tab không có đơn hàng được bỏ qua. Sắp xếp: nổi bật → ngày phỏng vấn gần nhất → mới tạo.
 */
export async function getJobTableGroups(limitPerTab = 12): Promise<JobTableGroup[]> {
  const [programs, rows] = await Promise.all([
    getActiveJobPrograms(),
    db.query.jobOrders.findMany({
      where: and(eq(jobOrders.status, "OPEN"), isNotNull(jobOrders.programId)),
      columns: { id: true, title: true, slug: true, quantity: true, location: true, salaryText: true, interviewDate: true, isFeatured: true, programId: true, createdAt: true },
      orderBy: [desc(jobOrders.isFeatured), desc(jobOrders.createdAt)],
    }),
  ]);

  const byProgram = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!row.programId) continue;
    const list = byProgram.get(row.programId) ?? [];
    list.push(row);
    byProgram.set(row.programId, list);
  }

  const far = Number.MAX_SAFE_INTEGER;
  return programs
    .map((p) => {
      const list = (byProgram.get(p.id) ?? []).sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        const da = a.interviewDate?.getTime() ?? far;
        const dbb = b.interviewDate?.getTime() ?? far;
        if (da !== dbb) return da - dbb;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        total: list.length,
        jobs: list.slice(0, limitPerTab).map((j) => ({
          id: j.id,
          title: j.title,
          slug: j.slug,
          quantity: j.quantity,
          location: j.location,
          salaryText: j.salaryText,
          interviewDate: j.interviewDate ? formatDate(j.interviewDate) : null,
          isFeatured: j.isFeatured,
        })),
      };
    })
    .filter((g) => g.jobs.length > 0);
}
