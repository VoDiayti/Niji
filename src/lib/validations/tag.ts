import { z } from "zod";
import { slugField } from "@/lib/validations/post";

/** Schema form thẻ (tag) */
export const tagSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên thẻ").max(50, "Tên thẻ tối đa 50 ký tự"),
  slug: slugField,
});

export type TagFormValues = z.infer<typeof tagSchema>;
