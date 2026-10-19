"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { faqSchema, type FaqFormValues } from "@/lib/validations/faq";

const ADMIN_PATH = "/admin/faq";

function revalidateFaqPages() {
  revalidatePath("/cau-hoi-thuong-gap");
  revalidatePath("/");
  revalidatePath(ADMIN_PATH);
}

function toData(v: FaqFormValues) {
  return {
    question: v.question,
    answer: v.answer,
    order: v.order ? Number(v.order) : 0,
    isActive: v.isActive,
  };
}

export async function createFaq(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = faqSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const item = await prisma.faq.create({ data: toData(parsed.data) });
    revalidateFaqPages();
    return ok({ id: item.id }, "Đã thêm câu hỏi");
  });
}

export async function updateFaq(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = faqSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const existing = await prisma.faq.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return fail("Không tìm thấy câu hỏi");
    await prisma.faq.update({ where: { id }, data: toData(parsed.data) });
    revalidateFaqPages();
    return ok({ id }, "Đã lưu câu hỏi");
  });
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const existing = await prisma.faq.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return fail("Không tìm thấy câu hỏi");
    await prisma.faq.delete({ where: { id } });
    revalidateFaqPages();
    return ok(undefined, "Đã xóa câu hỏi");
  });
}

export async function toggleFaqActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    await prisma.faq.update({ where: { id }, data: { isActive } });
    revalidateFaqPages();
    return ok(undefined, isActive ? "Đã hiển thị câu hỏi" : "Đã ẩn câu hỏi");
  });
}
