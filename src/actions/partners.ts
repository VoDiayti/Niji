"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, partners } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { partnerSchema, type PartnerFormValues } from "@/lib/validations/partner";

const ADMIN_PATH = "/admin/doi-tac";

function revalidatePartnerPages() {
  revalidatePath("/");
  revalidatePath("/gioi-thieu");
  revalidatePath(ADMIN_PATH);
}

function toData(v: PartnerFormValues) {
  return {
    name: v.name,
    logo: v.logo || null,
    website: v.website || null,
    order: v.order ? Number(v.order) : 0,
    isActive: v.isActive,
  };
}

export async function createPartner(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = partnerSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const [item] = await db.insert(partners).values(toData(parsed.data)).returning({ id: partners.id });
    revalidatePartnerPages();
    return ok({ id: item.id }, "Đã thêm đối tác");
  });
}

export async function updatePartner(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = partnerSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const existing = await db.query.partners.findFirst({ columns: { id: true }, where: eq(partners.id, id) });
    if (!existing) return fail("Không tìm thấy đối tác");
    await db.update(partners).set(toData(parsed.data)).where(eq(partners.id, id));
    revalidatePartnerPages();
    return ok({ id }, "Đã lưu đối tác");
  });
}

export async function deletePartner(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const existing = await db.query.partners.findFirst({ columns: { id: true }, where: eq(partners.id, id) });
    if (!existing) return fail("Không tìm thấy đối tác");
    await db.delete(partners).where(eq(partners.id, id));
    revalidatePartnerPages();
    return ok(undefined, "Đã xóa đối tác");
  });
}

export async function togglePartnerActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [row] = await db.update(partners).set({ isActive }).where(eq(partners.id, id)).returning({ id: partners.id });
    if (!row) return fail("Không tìm thấy đối tác");
    revalidatePartnerPages();
    return ok(undefined, isActive ? "Đã hiển thị đối tác" : "Đã ẩn đối tác");
  });
}
