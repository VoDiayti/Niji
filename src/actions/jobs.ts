"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { jobSchema, type JobFormValues } from "@/lib/validations/job";

const ADMIN_PATH = "/admin/don-hang";

function revalidateJobPages(jobSlugs: (string | undefined)[], marketSlugs: (string | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/don-hang");
  revalidatePath("/thi-truong");
  revalidatePath("/sitemap.xml");
  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin");
  for (const slug of new Set(jobSlugs.filter(Boolean) as string[])) revalidatePath(`/don-hang/${slug}`);
  for (const slug of new Set(marketSlugs.filter(Boolean) as string[])) revalidatePath(`/thi-truong/${slug}`);
}

async function resolveSlug(preferred: string | undefined, title: string, excludeId?: string) {
  const base = slugify(preferred ?? "") || slugify(title) || "don-hang";
  return uniqueSlug(base, async (slug) => {
    const found = await prisma.jobOrder.findUnique({ where: { slug }, select: { id: true } });
    return !!found && found.id !== excludeId;
  });
}

const toInt = (v: string | undefined): number | null => (v && v.trim() ? Number(v.replace(/[.,\s]/g, "")) : null);
const toDate = (v: string | undefined): Date | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
/** HTML chỉ có đoạn trống (<p></p>) → null */
function htmlOrNull(html: string | undefined): string | null {
  if (!html) return null;
  const empty = /^(\s*<p[^>]*>(\s|<br\s*\/?>|&nbsp;)*<\/p>\s*)*$/i.test(html);
  return empty ? null : html;
}

/** Chuyển giá trị form (chuỗi) sang dữ liệu Prisma */
function toData(v: JobFormValues) {
  return {
    title: v.title,
    marketId: v.marketId,
    industry: v.industry,
    quantity: toInt(v.quantity) ?? 1,
    gender: v.gender,
    ageMin: toInt(v.ageMin),
    ageMax: toInt(v.ageMax),
    salaryText: v.salaryText || null,
    salaryVnd: toInt(v.salaryVnd),
    cost: v.cost || null,
    location: v.location || null,
    deadline: toDate(v.deadline),
    interviewDate: toDate(v.interviewDate),
    departureNote: v.departureNote || null,
    description: htmlOrNull(v.description) ?? "",
    requirements: htmlOrNull(v.requirements),
    benefits: htmlOrNull(v.benefits),
    image: v.image || null,
    status: v.status,
    isFeatured: v.isFeatured,
  };
}

export async function createJob(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = jobSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const market = await prisma.market.findUnique({ where: { id: parsed.data.marketId }, select: { slug: true } });
    if (!market) return fail("Thị trường không tồn tại", { marketId: ["Thị trường không tồn tại"] });

    const slug = await resolveSlug(parsed.data.slug, parsed.data.title);
    const job = await prisma.jobOrder.create({ data: { ...toData(parsed.data), slug } });
    revalidateJobPages([slug], [market.slug]);
    return ok({ id: job.id }, "Đã tạo đơn hàng");
  });
}

export async function updateJob(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = jobSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const existing = await prisma.jobOrder.findUnique({ where: { id }, select: { slug: true, market: { select: { slug: true } } } });
    if (!existing) return fail("Không tìm thấy đơn hàng");
    const market = await prisma.market.findUnique({ where: { id: parsed.data.marketId }, select: { slug: true } });
    if (!market) return fail("Thị trường không tồn tại", { marketId: ["Thị trường không tồn tại"] });

    const slug = await resolveSlug(parsed.data.slug, parsed.data.title, id);
    await prisma.jobOrder.update({ where: { id }, data: { ...toData(parsed.data), slug } });
    revalidateJobPages([existing.slug, slug], [existing.market.slug, market.slug]);
    revalidatePath(`${ADMIN_PATH}/${id}`);
    return ok({ id }, "Đã lưu đơn hàng");
  });
}

export async function deleteJob(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const job = await prisma.jobOrder.findUnique({ where: { id }, select: { slug: true, market: { select: { slug: true } } } });
    if (!job) return fail("Không tìm thấy đơn hàng");
    await prisma.jobOrder.delete({ where: { id } });
    revalidateJobPages([job.slug], [job.market.slug]);
    return ok(undefined, "Đã xóa đơn hàng");
  });
}

/** Đổi nhanh trạng thái Đang tuyển ⇄ Đã đóng */
export async function toggleJobStatus(id: string): Promise<ActionResult<{ status: "OPEN" | "CLOSED" }>> {
  return safeAction(async () => {
    await assertUser();
    const job = await prisma.jobOrder.findUnique({ where: { id }, select: { status: true } });
    if (!job) return fail("Không tìm thấy đơn hàng");
    const status = job.status === "OPEN" ? "CLOSED" : "OPEN";
    const updated = await prisma.jobOrder.update({ where: { id }, data: { status }, select: { slug: true, market: { select: { slug: true } } } });
    revalidateJobPages([updated.slug], [updated.market.slug]);
    return ok({ status }, status === "OPEN" ? "Đã mở lại đơn hàng" : "Đã đóng đơn hàng");
  });
}

export async function toggleJobFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const job = await prisma.jobOrder.update({ where: { id }, data: { isFeatured }, select: { slug: true, market: { select: { slug: true } } } });
    revalidateJobPages([job.slug], [job.market.slug]);
    return ok(undefined, isFeatured ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
  });
}
