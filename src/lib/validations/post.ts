import { z } from "zod";

/** Giá trị đại diện "không chọn" cho Select (shadcn không cho phép SelectItem có value rỗng) */
export const NONE_VALUE = "__none__";

/** Slug hợp lệ: chữ thường không dấu, số, dấu gạch ngang */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Trường slug dùng chung: cho phép để trống (server tự sinh từ tiêu đề/tên) */
export const slugField = z
  .string()
  .trim()
  .max(200, "Đường dẫn tối đa 200 ký tự")
  .refine((v) => v === "" || SLUG_REGEX.test(v), "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang");

/** Trường thứ tự sắp xếp – giữ dạng chuỗi trên form, server chuyển sang số */
export const orderField = z.string().trim().regex(/^-?\d{0,6}$/, "Thứ tự phải là số nguyên");

export const POST_STATUS_VALUES = ["DRAFT", "PUBLISHED", "SCHEDULED"] as const;

/**
 * Schema form bài viết – dùng chung client (react-hook-form) và server action.
 * Mọi trường giữ dạng chuỗi/boolean để khớp kiểu input/output với zodResolver.
 * `publishedAt`: chuỗi thời gian (datetime-local trên form, ISO khi gửi lên server).
 */
export const postSchema = z
  .object({
    title: z.string().trim().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
    slug: slugField,
    excerpt: z.string().trim().max(500, "Mô tả ngắn tối đa 500 ký tự"),
    content: z.string().max(500_000, "Nội dung quá dài"),
    coverImage: z.string().trim().max(1000, "Đường dẫn ảnh quá dài"),
    categoryId: z.string().max(50),
    tagIds: z.array(z.string().max(50), { error: "Danh sách thẻ không hợp lệ" }).max(30, "Tối đa 30 thẻ"),
    newTags: z.string().trim().max(500, "Danh sách thẻ mới quá dài"),
    status: z.enum(POST_STATUS_VALUES, { error: "Trạng thái không hợp lệ" }),
    publishedAt: z.string().trim().max(40),
    isFeatured: z.boolean({ error: "Giá trị nổi bật không hợp lệ" }),
    metaTitle: z.string().trim().max(120, "Tiêu đề SEO tối đa 120 ký tự"),
    metaDescription: z.string().trim().max(300, "Mô tả SEO tối đa 300 ký tự"),
    ogImage: z.string().trim().max(1000, "Đường dẫn ảnh quá dài"),
  })
  .superRefine((v, ctx) => {
    if (v.publishedAt && Number.isNaN(Date.parse(v.publishedAt))) {
      ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Thời gian xuất bản không hợp lệ" });
      return;
    }
    if (v.status === "SCHEDULED") {
      if (!v.publishedAt) {
        ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Vui lòng chọn thời gian hẹn giờ đăng" });
      } else if (new Date(v.publishedAt).getTime() <= Date.now()) {
        ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Thời gian hẹn giờ đăng phải ở tương lai" });
      }
    }
  });

export type PostFormValues = z.infer<typeof postSchema>;
