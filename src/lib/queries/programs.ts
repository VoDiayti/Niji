import "server-only";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db, trainingPrograms } from "@/db";

const activeProgram = eq(trainingPrograms.isActive, true);
const programOrder = [asc(trainingPrograms.order), desc(trainingPrograms.createdAt)];

/** Chương trình du học / đào tạo đang mở */
export async function getActivePrograms() {
  return db.query.trainingPrograms.findMany({ where: activeProgram, orderBy: programOrder });
}

export async function getProgramBySlug(slug: string) {
  return db.query.trainingPrograms.findFirst({ where: and(eq(trainingPrograms.slug, slug), activeProgram) });
}

/** Chương trình khác (gợi ý ở cuối trang chi tiết) */
export async function getOtherPrograms(excludeId: string, limit = 3) {
  return db.query.trainingPrograms.findMany({
    where: and(activeProgram, ne(trainingPrograms.id, excludeId)),
    orderBy: programOrder,
    limit,
  });
}

/** Dùng cho sitemap */
export async function getProgramSlugs() {
  return db.query.trainingPrograms.findMany({ where: activeProgram, columns: { slug: true, updatedAt: true } });
}
