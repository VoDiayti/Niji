import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const optionalText = (max: number) => text(max).optional();
const ageString = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^(\d+)?$/, message)
    .refine((v) => !v || (Number(v) >= 15 && Number(v) <= 70), message)
    .optional();
/** Ngày từ input type="date" (yyyy-MM-dd), cho phép rỗng */
const dateString = z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Ngày không hợp lệ").optional();

export const JOB_GENDERS = ["MALE", "FEMALE", "ANY"] as const;
export const JOB_STATUSES = ["OPEN", "CLOSED"] as const;

/**
 * Schema form Đơn hàng tuyển dụng (dùng chung client + server).
 * Các trường số/ngày giữ dạng chuỗi; server action chuyển kiểu khi lưu.
 */
export const jobSchema = z
  .object({
    title: text(200).min(5, "Vui lòng nhập tiêu đề (tối thiểu 5 ký tự)"),
    slug: text(200).optional(),
    marketId: z.string().min(1, "Vui lòng chọn thị trường"),
    /** JobProgram.id – tab bảng đơn hàng trang chủ; "__none__" hoặc rỗng = không gắn */
    programId: z.string().optional(),
    industry: text(100).min(1, "Vui lòng nhập ngành nghề"),
    quantity: z
      .string()
      .trim()
      .regex(/^(\d+)?$/, "Số lượng phải là số nguyên")
      .refine((v) => !v || Number(v) >= 1, "Số lượng tối thiểu là 1")
      .optional(),
    gender: z.enum(JOB_GENDERS, "Vui lòng chọn giới tính"),
    ageMin: ageString("Tuổi phải là số từ 15 đến 70"),
    ageMax: ageString("Tuổi phải là số từ 15 đến 70"),
    salaryText: optionalText(200),
    /** Lương quy đổi VNĐ/tháng – cho phép "28.000.000" hoặc "28000000" */
    salaryVnd: z.string().trim().regex(/^[\d.,\s]*$/, "Chỉ nhập số, vd: 28000000").optional(),
    cost: optionalText(200),
    location: optionalText(200),
    deadline: dateString,
    interviewDate: dateString,
    departureNote: optionalText(500),
    /** HTML – mô tả công việc */
    description: z.string().optional(),
    requirements: z.string().optional(),
    benefits: z.string().optional(),
    image: z.string().nullable().optional(),
    status: z.enum(JOB_STATUSES, "Vui lòng chọn trạng thái"),
    isFeatured: z.boolean(),
  })
  .refine((d) => !d.ageMin || !d.ageMax || Number(d.ageMin) <= Number(d.ageMax), {
    path: ["ageMax"],
    message: "Tuổi đến phải lớn hơn hoặc bằng tuổi từ",
  });

export type JobFormValues = z.infer<typeof jobSchema>;
