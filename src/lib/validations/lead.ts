import { z } from "zod";

/** Regex số điện thoại di động Việt Nam (03x, 05x, 07x, 08x, 09x) */
export const VN_PHONE_REGEX = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;

/**
 * Schema form đăng ký tư vấn / ứng tuyển / liên hệ.
 * Mọi trường là chuỗi để dùng trực tiếp với react-hook-form; server sẽ chuyển kiểu khi lưu.
 */
export const leadFormSchema = z.object({
  type: z.enum(["CONSULTATION", "APPLICATION", "CONTACT"]),
  fullName: z.string().trim().min(2, "Vui lòng nhập họ và tên").max(100, "Họ tên quá dài"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(VN_PHONE_REGEX, "Số điện thoại không hợp lệ")),
  email: z.union([z.literal(""), z.email("Email không hợp lệ")]).optional(),
  birthYear: z
    .union([z.literal(""), z.string().regex(/^(19|20)\d{2}$/, "Năm sinh không hợp lệ (vd: 1998)")])
    .optional(),
  hometown: z.string().trim().max(100, "Quê quán quá dài").optional(),
  marketId: z.string().max(50).optional(),
  jobOrderId: z.string().max(50).optional(),
  message: z.string().trim().max(2000, "Ghi chú tối đa 2000 ký tự").optional(),
  /** Trang gửi form, dùng để thống kê nguồn */
  source: z.string().max(300).optional(),
  /** Honeypot chống spam – người dùng thật không bao giờ điền trường này */
  website: z.string().max(0, "Yêu cầu không hợp lệ").optional(),
});

export type LeadFormInput = z.input<typeof leadFormSchema>;
export type LeadFormValues = z.output<typeof leadFormSchema>;
