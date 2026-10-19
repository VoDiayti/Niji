import { z } from "zod";
import { orderField, slugField } from "@/lib/validations/post";

/** Schema form chuyên mục (dialog tạo/sửa) */
export const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên chuyên mục tối thiểu 2 ký tự").max(100, "Tên chuyên mục tối đa 100 ký tự"),
  slug: slugField,
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự"),
  order: orderField,
  isActive: z.boolean({ error: "Giá trị hiển thị không hợp lệ" }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
