"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, jobOrders, leads, markets } from "@/db";
import { leadFormSchema } from "@/lib/validations/lead";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";

/**
 * Server action nhận form đăng ký tư vấn / ứng tuyển / liên hệ từ trang công khai.
 * - Validate bằng Zod (cùng schema với client)
 * - Honeypot: trường `website` có giá trị → coi là bot, trả về thành công giả
 * - Rate limit theo IP (binding LEAD_RATE_LIMITER của Workers, dự phòng bộ nhớ)
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
      data.marketId ? db.query.markets.findFirst({ columns: { id: true }, where: eq(markets.id, data.marketId) }) : null,
      data.jobOrderId ? db.query.jobOrders.findFirst({ columns: { id: true }, where: eq(jobOrders.id, data.jobOrderId) }) : null,
    ]);

    await db.insert(leads).values({
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
