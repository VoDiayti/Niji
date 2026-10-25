"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, faqs } from "@/db";
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
    const [item] = await db.insert(faqs).values(toData(parsed.data)).returning({ id: faqs.id });
    revalidateFaqPages();
    return ok({ id: item.id }, "Đã thêm câu hỏi");
  });
}

export async function updateFaq(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = faqSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const existing = await db.query.faqs.findFirst({ columns: { id: true }, where: eq(faqs.id, id) });
    if (!existing) return fail("Không tìm thấy câu hỏi");
    await db.update(faqs).set(toData(parsed.data)).where(eq(faqs.id, id));
    revalidateFaqPages();
    return ok({ id }, "Đã lưu câu hỏi");
  });
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const existing = await db.query.faqs.findFirst({ columns: { id: true }, where: eq(faqs.id, id) });
    if (!existing) return fail("Không tìm thấy câu hỏi");
    await db.delete(faqs).where(eq(faqs.id, id));
    revalidateFaqPages();
    return ok(undefined, "Đã xóa câu hỏi");
  });
}

export async function toggleFaqActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [row] = await db.update(faqs).set({ isActive }).where(eq(faqs.id, id)).returning({ id: faqs.id });
    if (!row) return fail("Không tìm thấy câu hỏi");
    revalidateFaqPages();
    return ok(undefined, isActive ? "Đã hiển thị câu hỏi" : "Đã ẩn câu hỏi");
  });
}
