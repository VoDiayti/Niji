import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);

/** Schema form Câu hỏi thường gặp (giữ dạng chuỗi, server chuyển kiểu) */
export const faqSchema = z.object({
  question: text(500).min(5, "Vui lòng nhập câu hỏi"),
  answer: text(5000).min(5, "Vui lòng nhập câu trả lời"),
  order: z.string().trim().regex(/^(-?\d+)?$/, "Thứ tự phải là số nguyên").optional(),
  isActive: z.boolean(),
});

export type FaqFormValues = z.infer<typeof faqSchema>;
