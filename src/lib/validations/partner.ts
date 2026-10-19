import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);

/** Schema form Đối tác (giữ dạng chuỗi, server chuyển kiểu) */
export const partnerSchema = z.object({
  name: text(150).min(2, "Vui lòng nhập tên đối tác"),
  logo: z.string().nullable().optional(),
  website: z.union([z.literal(""), z.url("Website không hợp lệ (vd: https://example.com)")]).optional(),
  order: z.string().trim().regex(/^(-?\d+)?$/, "Thứ tự phải là số nguyên").optional(),
  isActive: z.boolean(),
});

export type PartnerFormValues = z.infer<typeof partnerSchema>;
