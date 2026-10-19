"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { leadNoteSchema, leadStatusSchema } from "@/lib/validations/lead-admin";
import { LEAD_STATUS_LABELS } from "@/lib/constants";

const ADMIN_PATH = "/admin/dang-ky";

function revalidateLeadPages(id?: string) {
  revalidatePath("/admin");
  revalidatePath(ADMIN_PATH);
  if (id) revalidatePath(`${ADMIN_PATH}/${id}`);
}

export async function updateLeadStatus(id: string, status: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const parsed = leadStatusSchema.safeParse({ id, status });
    if (!parsed.success) return zodFail(parsed.error);

    const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) return fail("Không tìm thấy đăng ký");

    await prisma.lead.update({ where: { id }, data: { status: parsed.data.status } });
    revalidateLeadPages(id);
    return ok(undefined, `Đã chuyển trạng thái: ${LEAD_STATUS_LABELS[parsed.data.status]}`);
  });
}

export async function updateLeadNote(id: string, adminNote: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const parsed = leadNoteSchema.safeParse({ id, adminNote });
    if (!parsed.success) return zodFail(parsed.error);

    const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) return fail("Không tìm thấy đăng ký");

    await prisma.lead.update({ where: { id }, data: { adminNote: parsed.data.adminNote || null } });
    revalidateLeadPages(id);
    return ok(undefined, "Đã lưu ghi chú nội bộ");
  });
}

export async function deleteLead(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) return fail("Không tìm thấy đăng ký");
    await prisma.lead.delete({ where: { id } });
    revalidateLeadPages();
    return ok(undefined, "Đã xóa đăng ký");
  });
}
