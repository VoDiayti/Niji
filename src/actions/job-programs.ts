"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, jobOrders, jobPrograms } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { jobProgramSchema, type JobProgramFormValues } from "@/lib/validations/job-program";

const ADMIN_PATH = "/admin/chuong-trinh";

async function programSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await db.query.jobPrograms.findFirst({
    columns: { id: true },
    where: and(eq(jobPrograms.slug, slug), excludeId ? ne(jobPrograms.id, excludeId) : undefined),
  });
  return found !== undefined;
}

/** Chương trình là tab của bảng đơn hàng trang chủ và bộ lọc ở trang đơn hàng công khai */
function revalidateProgramPages() {
  revalidatePath("/");
  revalidatePath("/don-hang");
  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin/don-hang");
}

/** Chuyển giá trị form (chuỗi) sang dữ liệu ghi DB */
function toData(v: JobProgramFormValues, slug: string) {
  return { name: v.name, slug, description: v.description || null, order: Number(v.order) || 0, isActive: v.isActive };
}

export async function createJobProgram(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = jobProgramSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const slug = await uniqueSlug(slugify(d.slug || d.name) || "chuong-trinh", (s) => programSlugExists(s));
    const [program] = await db.insert(jobPrograms).values(toData(d, slug)).returning({ id: jobPrograms.id });
    revalidateProgramPages();
    return ok({ id: program.id }, "Đã tạo chương trình");
  });
}

export async function updateJobProgram(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = jobProgramSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const current = await db.query.jobPrograms.findFirst({ columns: { id: true }, where: eq(jobPrograms.id, id) });
    if (!current) return fail("Chương trình không tồn tại hoặc đã bị xóa.");
    const slug = await uniqueSlug(slugify(d.slug || d.name) || "chuong-trinh", (s) => programSlugExists(s, id));
    await db.update(jobPrograms).set(toData(d, slug)).where(eq(jobPrograms.id, id));
    revalidateProgramPages();
    return ok({ id }, "Đã lưu chương trình");
  });
}

/**
 * Xóa chương trình. `JobOrder.programId` không có FK nên phải tự gỡ liên kết:
 * các đơn hàng đang gắn được đặt programId = null (không bị xóa, chỉ không còn hiện trong bảng trang chủ).
 */
export async function deleteJobProgram(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const program = await db.query.jobPrograms.findFirst({ columns: { id: true }, where: eq(jobPrograms.id, id) });
    if (!program) return fail("Chương trình không tồn tại hoặc đã bị xóa.");
    await db.batch([
      db.update(jobOrders).set({ programId: null }).where(eq(jobOrders.programId, id)),
      db.delete(jobPrograms).where(eq(jobPrograms.id, id)),
    ]);
    revalidateProgramPages();
    return ok(undefined, "Đã xóa chương trình");
  });
}

/** Bật/tắt nhanh tab trên trang chủ */
export async function toggleJobProgramActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [row] = await db.update(jobPrograms).set({ isActive }).where(eq(jobPrograms.id, id)).returning({ id: jobPrograms.id });
    if (!row) return fail("Chương trình không tồn tại hoặc đã bị xóa.");
    revalidateProgramPages();
    return ok(undefined, isActive ? "Đã hiển thị chương trình" : "Đã ẩn chương trình");
  });
}
