import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { banners, db, faqs, partners, testimonials } from "@/db";

/** Banner trang chủ */
export async function getActiveBanners() {
  return db.query.banners.findMany({ where: eq(banners.isActive, true), orderBy: [asc(banners.order), desc(banners.createdAt)] });
}

/** Cảm nhận học viên / người lao động */
export async function getActiveTestimonials(limit = 6) {
  return db.query.testimonials.findMany({
    where: eq(testimonials.isActive, true),
    orderBy: [asc(testimonials.order), desc(testimonials.createdAt)],
    limit,
  });
}

/** Đối tác */
export async function getActivePartners() {
  return db.query.partners.findMany({ where: eq(partners.isActive, true), orderBy: [asc(partners.order), asc(partners.name)] });
}

/** Câu hỏi thường gặp */
export async function getActiveFaqs() {
  return db.query.faqs.findMany({ where: eq(faqs.isActive, true), orderBy: [asc(faqs.order), asc(faqs.createdAt)] });
}
