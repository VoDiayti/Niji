import { z } from "zod";
import { orderField, slugField } from "@/lib/validations/post";

/** Schema form Chương trình (tab bảng đơn hàng trang chủ) – dialog tạo/sửa */
export const jobProgramSchema = z.object({
  name: z.string().trim().min(2, "Tên chương trình tối thiểu 2 ký tự").max(100, "Tên chương trình tối đa 100 ký tự"),
  slug: slugField,
  description: z.string().trim().max(300, "Mô tả tối đa 300 ký tự"),
  order: orderField,
  isActive: z.boolean({ error: "Giá trị hiển thị không hợp lệ" }),
});

export type JobProgramFormValues = z.infer<typeof jobProgramSchema>;
