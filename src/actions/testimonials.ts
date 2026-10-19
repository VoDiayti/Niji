"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { testimonialSchema, type TestimonialFormValues } from "@/lib/validations/testimonial";

const ADMIN_PATH = "/admin/cam-nhan";

function revalidateTestimonialPages() {
  revalidatePath("/");
  revalidatePath("/gioi-thieu");
  revalidatePath(ADMIN_PATH);
}

function toData(v: TestimonialFormValues) {
  return {
    name: v.name,
    position: v.position || null,
    content: v.content,
    avatar: v.avatar || null,
    rating: Number(v.rating),
    order: v.order ? Number(v.order) : 0,
    isActive: v.isActive,
  };
}

export async function createTestimonial(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = testimonialSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const item = await prisma.testimonial.create({ data: toData(parsed.data) });
    revalidateTestimonialPages();
    return ok({ id: item.id }, "Đã thêm cảm nhận");
  });
}

export async function updateTestimonial(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = testimonialSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const existing = await prisma.testimonial.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return fail("Không tìm thấy cảm nhận");
    await prisma.testimonial.update({ where: { id }, data: toData(parsed.data) });
    revalidateTestimonialPages();
    return ok({ id }, "Đã lưu cảm nhận");
  });
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const existing = await prisma.testimonial.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return fail("Không tìm thấy cảm nhận");
    await prisma.testimonial.delete({ where: { id } });
    revalidateTestimonialPages();
    return ok(undefined, "Đã xóa cảm nhận");
  });
}

export async function toggleTestimonialActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    await prisma.testimonial.update({ where: { id }, data: { isActive } });
    revalidateTestimonialPages();
    return ok(undefined, isActive ? "Đã hiển thị cảm nhận" : "Đã ẩn cảm nhận");
  });
}
