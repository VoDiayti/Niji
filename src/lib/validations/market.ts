import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const optionalText = (max: number) => text(max).optional();
/** Số nguyên nhập dạng chuỗi (cho phép rỗng) – server chuyển sang number */
const intString = (message: string) => z.string().trim().regex(/^(-?\d+)?$/, message).optional();

/**
 * Schema form Thị trường (dùng chung client + server).
 * Mọi trường giữ dạng chuỗi/boolean để input = output với react-hook-form;
 * server action chuyển kiểu (số, mảng, null) khi lưu.
 */
export const marketSchema = z.object({
  name: text(150).min(2, "Vui lòng nhập tên thị trường"),
  slug: text(200).optional(),
  countryCode: z.string().trim().toUpperCase().regex(/^([A-Z]{2})?$/, "Mã quốc gia gồm 2 chữ cái (vd: JP, KR, TW)").optional(),
  image: z.string().nullable().optional(),
  summary: optionalText(500),
  /** HTML từ trình soạn thảo */
  description: z.string().optional(),
  /** HTML – điều kiện tham gia */
  requirements: z.string().optional(),
  salaryRange: optionalText(200),
  cost: optionalText(200),
  duration: optionalText(200),
  /** Mỗi dòng một ngành nghề */
  industriesText: z.string().optional(),
  /** Mỗi dòng một ưu điểm */
  highlightsText: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  order: intString("Thứ tự phải là số nguyên"),
  metaTitle: optionalText(160),
  metaDescription: optionalText(320),
});

export type MarketFormValues = z.infer<typeof marketSchema>;
