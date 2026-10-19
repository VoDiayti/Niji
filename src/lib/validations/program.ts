import { z } from "zod";
import { orderField, slugField } from "@/lib/validations/post";

export const PROGRAM_TYPE_VALUES = ["STUDY_ABROAD", "LANGUAGE", "VOCATIONAL"] as const;

/** Schema form chương trình du học – đào tạo */
export const programSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
  slug: slugField,
  type: z.enum(PROGRAM_TYPE_VALUES, { error: "Loại chương trình không hợp lệ" }),
  summary: z.string().trim().max(500, "Tóm tắt tối đa 500 ký tự"),
  content: z.string().max(500_000, "Nội dung quá dài"),
  image: z.string().trim().max(1000, "Đường dẫn ảnh quá dài"),
  duration: z.string().trim().max(100, "Thời lượng tối đa 100 ký tự"),
  tuition: z.string().trim().max(200, "Học phí tối đa 200 ký tự"),
  order: orderField,
  isActive: z.boolean({ error: "Giá trị hiển thị không hợp lệ" }),
});

export type ProgramFormValues = z.infer<typeof programSchema>;
