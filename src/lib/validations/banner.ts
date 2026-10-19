import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const optionalText = (max: number) => text(max).optional();

/** Schema form Banner trang chủ (giữ dạng chuỗi, server chuyển kiểu) */
export const bannerSchema = z.object({
  title: text(200).min(1, "Vui lòng nhập tiêu đề"),
  subtitle: optionalText(500),
  image: z.string({ error: "Vui lòng chọn ảnh banner" }).min(1, "Vui lòng chọn ảnh banner"),
  ctaText: optionalText(60),
  ctaLink: optionalText(500),
  ctaText2: optionalText(60),
  ctaLink2: optionalText(500),
  order: z.string().trim().regex(/^(-?\d+)?$/, "Thứ tự phải là số nguyên").optional(),
  isActive: z.boolean(),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;
