import "server-only";
import { and, asc, count, desc, eq, gte, inArray, isNull, like, lt, lte, ne, or, type SQL } from "drizzle-orm";
import { db, jobOrders, jobPrograms, markets } from "@/db";
import type { JobOrder, Market } from "@/db/types";
import { AGE_RANGES, PAGE_SIZE, SALARY_RANGES } from "@/lib/constants";
import { slugify } from "@/lib/slug";

/** Các trường cần cho card đơn hàng */
export const jobCardColumns = {
  id: true,
  title: true,
  slug: true,
  industry: true,
  quantity: true,
  gender: true,
  ageMin: true,
  ageMax: true,
  salaryText: true,
  salaryVnd: true,
  location: true,
  deadline: true,
  image: true,
  isFeatured: true,
  createdAt: true,
} as const;

const jobCardWith = { market: { columns: { name: true, slug: true, countryCode: true } } } as const;

export type JobCardData = Pick<JobOrder, keyof typeof jobCardColumns> & {
  market: Pick<Market, "name" | "slug" | "countryCode">;
};

export type JobDetail = JobOrder & { market: Market };

const openJob = eq(jobOrders.status, "OPEN");
const jobOrder = [desc(jobOrders.isFeatured), desc(jobOrders.createdAt)];

/** Đơn hàng đã quá hạn nộp hồ sơ? (vẫn hiển thị khi status = OPEN, chỉ gắn nhãn) */
export function isDeadlinePassed(deadline: Date | null | undefined): boolean {
  return deadline ? deadline.getTime() < Date.now() : false;
}

/** Tham số lọc đọc từ URL trang /don-hang */
export type JobFilters = {
  /** slug thị trường */
  market?: string;
  /** slug chương trình (tab bảng đơn hàng) */
  program?: string;
  industry?: string;
  gender?: string;
  age?: string;
  salary?: string;
  q?: string;
  page?: number;
};

/** Chuyển tham số lọc thành điều kiện SQL (Drizzle) */
export function buildJobWhere(f: JobFilters): SQL | undefined {
  const conditions: (SQL | undefined)[] = [openJob];

  if (f.program) {
    conditions.push(inArray(jobOrders.programId, db.select({ id: jobPrograms.id }).from(jobPrograms).where(eq(jobPrograms.slug, f.program))));
  }

  if (f.market) {
    conditions.push(
      inArray(
        jobOrders.marketId,
        db.select({ id: markets.id }).from(markets).where(and(eq(markets.slug, f.market), eq(markets.isActive, true)))
      )
    );
  }
  if (f.industry) conditions.push(eq(jobOrders.industry, f.industry));

  if (f.gender === "MALE" || f.gender === "FEMALE") {
    // Lao động nam xem được đơn tuyển nam và đơn tuyển cả nam/nữ
    conditions.push(inArray(jobOrders.gender, [f.gender, "ANY"]));
  } else if (f.gender === "ANY") {
    conditions.push(eq(jobOrders.gender, "ANY"));
  }

  const age = AGE_RANGES.find((r) => r.value === f.age);
  if (age) {
    conditions.push(or(isNull(jobOrders.ageMin), lte(jobOrders.ageMin, age.max)));
    conditions.push(or(isNull(jobOrders.ageMax), gte(jobOrders.ageMax, age.min)));
  }

  const salary = SALARY_RANGES.find((r) => r.value === f.salary);
  if (salary) {
    conditions.push(gte(jobOrders.salaryVnd, salary.min), lt(jobOrders.salaryVnd, salary.max));
  }

  const q = f.q?.trim();
  if (q) {
    const pattern = `%${q}%`;
    const terms: (SQL | undefined)[] = [
      like(jobOrders.title, pattern),
      like(jobOrders.industry, pattern),
      like(jobOrders.location, pattern),
    ];
    // Tìm theo slug để khớp cả khi người dùng gõ không dấu ("nhat ban" → "nhat-ban")
    const s = slugify(q);
    if (s) terms.push(like(jobOrders.slug, `%${s}%`));
    conditions.push(or(...terms));
  }

  return and(...conditions);
}

/** Danh sách đơn hàng có lọc + phân trang */
export async function searchJobs(f: JobFilters) {
  const where = buildJobWhere(f);
  const page = Math.max(1, Math.floor(f.page ?? 1));
  const [items, [{ total }]] = await Promise.all([
    db.query.jobOrders.findMany({
      where,
      columns: jobCardColumns,
      with: jobCardWith,
      orderBy: jobOrder,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    db.select({ total: count() }).from(jobOrders).where(where),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Đơn hàng mới nhất cho trang chủ */
export async function getLatestJobs(limit = 6) {
  return db.query.jobOrders.findMany({ where: openJob, columns: jobCardColumns, with: jobCardWith, orderBy: jobOrder, limit });
}

/** Đơn hàng đang tuyển thuộc một thị trường */
export async function getJobsByMarket(marketId: string, limit = 6) {
  return db.query.jobOrders.findMany({
    where: and(openJob, eq(jobOrders.marketId, marketId)),
    columns: jobCardColumns,
    with: jobCardWith,
    orderBy: jobOrder,
    limit,
  });
}

/** Chi tiết đơn hàng (chỉ đơn đang tuyển) */
export async function getJobBySlug(slug: string): Promise<JobDetail | null> {
  const job = await db.query.jobOrders.findFirst({ where: and(eq(jobOrders.slug, slug), openJob), with: { market: true } });
  return job ?? null;
}

/** Đơn hàng liên quan cùng thị trường */
export async function getRelatedJobs(marketId: string, excludeId: string, limit = 3) {
  return db.query.jobOrders.findMany({
    where: and(openJob, eq(jobOrders.marketId, marketId), ne(jobOrders.id, excludeId)),
    columns: jobCardColumns,
    with: jobCardWith,
    orderBy: jobOrder,
    limit,
  });
}

/** Danh sách ngành nghề (distinct) của các đơn đang tuyển – dùng cho bộ lọc */
export async function getJobIndustries(): Promise<string[]> {
  const rows = await db.selectDistinct({ industry: jobOrders.industry }).from(jobOrders).where(openJob).orderBy(asc(jobOrders.industry));
  return rows.map((r) => r.industry).filter(Boolean);
}

/** Dùng cho sitemap */
export async function getJobSlugs() {
  return db.query.jobOrders.findMany({ where: openJob, columns: { slug: true, updatedAt: true } });
}
