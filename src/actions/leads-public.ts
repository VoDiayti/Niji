"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { leadFormSchema } from "@/lib/validations/lead";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";

/**
 * Server action nhận form đăng ký tư vấn / ứng tuyển / liên hệ từ trang công khai.
 * - Validate bằng Zod (cùng schema với client)
 * - Honeypot: trường `website` có giá trị → coi là bot, trả về thành công giả
 * - Rate limit theo IP
 */
export async function submitLead(input: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    const parsed = leadFormSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const data = parsed.data;

    if (data.website) return ok(undefined, "Đăng ký thành công!");

    const ip = getClientIp(await headers());
    const limit = await checkRateLimit(`lead:${ip}`);
    if (!limit.allowed) {
      return fail(`Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.max(1, Math.ceil(limit.retryAfterSeconds / 60))} phút.`);
    }

    // Kiểm tra khóa ngoại để tránh lỗi khi thị trường/đơn hàng không còn tồn tại
    const [market, jobOrder] = await Promise.all([
      data.marketId ? prisma.market.findUnique({ where: { id: data.marketId }, select: { id: true } }) : null,
      data.jobOrderId ? prisma.jobOrder.findUnique({ where: { id: data.jobOrderId }, select: { id: true } }) : null,
    ]);

    await prisma.lead.create({
      data: {
        type: data.type,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        birthYear: data.birthYear ? Number(data.birthYear) : null,
        hometown: data.hometown || null,
        marketId: market?.id ?? null,
        jobOrderId: jobOrder?.id ?? null,
        message: data.message || null,
        source: data.source || null,
        ipAddress: ip,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/dang-ky");

    return ok(
      undefined,
      data.type === "CONTACT"
        ? "Đã gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất."
        : "Đăng ký thành công! Tư vấn viên sẽ liên hệ với bạn trong thời gian sớm nhất."
    );
  });
}
