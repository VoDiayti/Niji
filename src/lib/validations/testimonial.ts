import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);

export const RATING_OPTIONS = ["5", "4", "3", "2", "1"] as const;

/** Schema form Cảm nhận học viên (giữ dạng chuỗi, server chuyển kiểu) */
export const testimonialSchema = z.object({
  name: text(100).min(2, "Vui lòng nhập tên học viên"),
  position: text(200).optional(),
  content: text(2000).min(10, "Nội dung cảm nhận tối thiểu 10 ký tự"),
  avatar: z.string().nullable().optional(),
  rating: z.enum(RATING_OPTIONS, "Vui lòng chọn đánh giá"),
  order: z.string().trim().regex(/^(-?\d+)?$/, "Thứ tự phải là số nguyên").optional(),
  isActive: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;
