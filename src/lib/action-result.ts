import { z } from "zod";

/** Kết quả trả về chuẩn của mọi server action. */
export type ActionResult<T = undefined> =
  | { success: true; message?: string; data?: T }
  | { success: false; message: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data?: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

export function fail<T = undefined>(message: string, fieldErrors?: Record<string, string[]>): ActionResult<T> {
  return { success: false, message, fieldErrors };
}

/** Chuyển lỗi Zod thành ActionResult thất bại kèm lỗi theo từng trường. */
export function zodFail<T = undefined>(error: z.ZodError, message = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại."): ActionResult<T> {
  const flat = z.flattenError(error);
  return { success: false, message, fieldErrors: flat.fieldErrors as Record<string, string[]> };
}

/** Bọc server action: bắt lỗi, trả về thông báo thân thiện (không lộ chi tiết lỗi hệ thống). */
export async function safeAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    // Next.js dùng throw để redirect – phải ném lại
    if (error && typeof error === "object" && "digest" in error && String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof Error && error.name === "UnauthorizedError") return fail(error.message);
    console.error("[action]", error);
    return fail("Có lỗi xảy ra, vui lòng thử lại sau.");
  }
}
