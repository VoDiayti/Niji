import "server-only";
import { prisma } from "@/lib/prisma";

/** Banner trang chủ */
export async function getActiveBanners() {
  return prisma.banner.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
}

/** Cảm nhận học viên / người lao động */
export async function getActiveTestimonials(limit = 6) {
  return prisma.testimonial.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }], take: limit });
}

/** Đối tác */
export async function getActivePartners() {
  return prisma.partner.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { name: "asc" }] });
}

/** Câu hỏi thường gặp */
export async function getActiveFaqs() {
  return prisma.faq.findMany({ where: { isActive: true }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
}
