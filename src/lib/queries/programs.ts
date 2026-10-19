import "server-only";
import { prisma } from "@/lib/prisma";

/** Chương trình du học / đào tạo đang mở */
export async function getActivePrograms() {
  return prisma.trainingProgram.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProgramBySlug(slug: string) {
  return prisma.trainingProgram.findFirst({ where: { slug, isActive: true } });
}

/** Chương trình khác (gợi ý ở cuối trang chi tiết) */
export async function getOtherPrograms(excludeId: string, limit = 3) {
  return prisma.trainingProgram.findMany({
    where: { isActive: true, id: { not: excludeId } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

/** Dùng cho sitemap */
export async function getProgramSlugs() {
  return prisma.trainingProgram.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
}
