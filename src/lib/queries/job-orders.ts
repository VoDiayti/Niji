import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { AGE_RANGES, PAGE_SIZE, SALARY_RANGES } from "@/lib/constants";
import { slugify } from "@/lib/slug";

/** Các trường cần cho card đơn hàng */
export const jobCardSelect = {
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
  market: { select: { name: true, slug: true, countryCode: true } },
} satisfies Prisma.JobOrderSelect;

export type JobCardData = Prisma.JobOrderGetPayload<{ select: typeof jobCardSelect }>;

export type JobDetail = Prisma.JobOrderGetPayload<{ include: { market: true } }>;

/** Đơn hàng đã quá hạn nộp hồ sơ? (vẫn hiển thị khi status = OPEN, chỉ gắn nhãn) */
export function isDeadlinePassed(deadline: Date | null | undefined): boolean {
  return deadline ? deadline.getTime() < Date.now() : false;
}

/** Tham số lọc đọc từ URL trang /don-hang */
export type JobFilters = {
  /** slug thị trường */
  market?: string;
  industry?: string;
  gender?: string;
  age?: string;
  salary?: string;
  q?: string;
  page?: number;
};

/** Chuyển tham số lọc thành điều kiện Prisma */
export function buildJobWhere(f: JobFilters): Prisma.JobOrderWhereInput {
  const and: Prisma.JobOrderWhereInput[] = [{ status: "OPEN" }];

  if (f.market) and.push({ market: { slug: f.market, isActive: true } });
  if (f.industry) and.push({ industry: f.industry });

  if (f.gender === "MALE" || f.gender === "FEMALE") {
    // Lao động nam xem được đơn tuyển nam và đơn tuyển cả nam/nữ
    and.push({ gender: { in: [f.gender, "ANY"] } });
  } else if (f.gender === "ANY") {
    and.push({ gender: "ANY" });
  }

  const age = AGE_RANGES.find((r) => r.value === f.age);
  if (age) {
    and.push({ OR: [{ ageMin: null }, { ageMin: { lte: age.max } }] });
    and.push({ OR: [{ ageMax: null }, { ageMax: { gte: age.min } }] });
  }

  const salary = SALARY_RANGES.find((r) => r.value === f.salary);
  if (salary) {
    and.push({ salaryVnd: { gte: salary.min, lt: salary.max } });
  }

  const q = f.q?.trim();
  if (q) {
    const or: Prisma.JobOrderWhereInput[] = [
      { title: { contains: q } },
      { industry: { contains: q } },
      { location: { contains: q } },
    ];
    // Tìm theo slug để khớp cả khi người dùng gõ không dấu ("nhat ban" → "nhat-ban")
    const s = slugify(q);
    if (s) or.push({ slug: { contains: s } });
    and.push({ OR: or });
  }

  return { AND: and };
}

/** Danh sách đơn hàng có lọc + phân trang */
export async function searchJobs(f: JobFilters) {
  const where = buildJobWhere(f);
  const page = Math.max(1, Math.floor(f.page ?? 1));
  const [items, total] = await prisma.$transaction([
    prisma.jobOrder.findMany({
      where,
      select: jobCardSelect,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobOrder.count({ where }),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Đơn hàng mới nhất cho trang chủ */
export async function getLatestJobs(limit = 6) {
  return prisma.jobOrder.findMany({
    where: { status: "OPEN" },
    select: jobCardSelect,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

/** Đơn hàng đang tuyển thuộc một thị trường */
export async function getJobsByMarket(marketId: string, limit = 6) {
  return prisma.jobOrder.findMany({
    where: { status: "OPEN", marketId },
    select: jobCardSelect,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

/** Chi tiết đơn hàng (chỉ đơn đang tuyển) */
export async function getJobBySlug(slug: string): Promise<JobDetail | null> {
  return prisma.jobOrder.findFirst({ where: { slug, status: "OPEN" }, include: { market: true } });
}

/** Đơn hàng liên quan cùng thị trường */
export async function getRelatedJobs(marketId: string, excludeId: string, limit = 3) {
  return prisma.jobOrder.findMany({
    where: { status: "OPEN", marketId, id: { not: excludeId } },
    select: jobCardSelect,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

/** Danh sách ngành nghề (distinct) của các đơn đang tuyển – dùng cho bộ lọc */
export async function getJobIndustries(): Promise<string[]> {
  const rows = await prisma.jobOrder.findMany({
    where: { status: "OPEN" },
    distinct: ["industry"],
    select: { industry: true },
    orderBy: { industry: "asc" },
  });
  return rows.map((r) => r.industry).filter(Boolean);
}

/** Dùng cho sitemap */
export async function getJobSlugs() {
  return prisma.jobOrder.findMany({ where: { status: "OPEN" }, select: { slug: true, updatedAt: true } });
}
