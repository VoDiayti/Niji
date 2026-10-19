"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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
    const item = await prisma.partner.create({ data: toData(parsed.data) });
    revalidatePartnerPages();
    return ok({ id: item.id }, "Đã thêm đối tác");
  });
}

export async function updatePartner(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = partnerSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const existing = await prisma.partner.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return fail("Không tìm thấy đối tác");
    await prisma.partner.update({ where: { id }, data: toData(parsed.data) });
    revalidatePartnerPages();
    return ok({ id }, "Đã lưu đối tác");
  });
}

export async function deletePartner(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const existing = await prisma.partner.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return fail("Không tìm thấy đối tác");
    await prisma.partner.delete({ where: { id } });
    revalidatePartnerPages();
    return ok(undefined, "Đã xóa đối tác");
  });
}

export async function togglePartnerActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    await prisma.partner.update({ where: { id }, data: { isActive } });
    revalidatePartnerPages();
    return ok(undefined, isActive ? "Đã hiển thị đối tác" : "Đã ẩn đối tác");
  });
}
