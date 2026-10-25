"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, leads } from "@/db";
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

async function findLeadId(id: string) {
  return db.query.leads.findFirst({ columns: { id: true }, where: eq(leads.id, id) });
}

export async function updateLeadStatus(id: string, status: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const parsed = leadStatusSchema.safeParse({ id, status });
    if (!parsed.success) return zodFail(parsed.error);

    const lead = await findLeadId(id);
    if (!lead) return fail("Không tìm thấy đăng ký");

    await db.update(leads).set({ status: parsed.data.status }).where(eq(leads.id, id));
    revalidateLeadPages(id);
    return ok(undefined, `Đã chuyển trạng thái: ${LEAD_STATUS_LABELS[parsed.data.status]}`);
  });
}

export async function updateLeadNote(id: string, adminNote: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const parsed = leadNoteSchema.safeParse({ id, adminNote });
    if (!parsed.success) return zodFail(parsed.error);

    const lead = await findLeadId(id);
    if (!lead) return fail("Không tìm thấy đăng ký");

    await db.update(leads).set({ adminNote: parsed.data.adminNote || null }).where(eq(leads.id, id));
    revalidateLeadPages(id);
    return ok(undefined, "Đã lưu ghi chú nội bộ");
  });
}

export async function deleteLead(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const lead = await findLeadId(id);
    if (!lead) return fail("Không tìm thấy đăng ký");
    await db.delete(leads).where(eq(leads.id, id));
    revalidateLeadPages();
    return ok(undefined, "Đã xóa đăng ký");
  });
}
