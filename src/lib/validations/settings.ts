import { z } from "zod";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const optionalText = (max: number) => text(max).optional();
const optionalUrl = z.union([z.literal(""), z.url("Đường dẫn không hợp lệ (phải bắt đầu bằng https://)")]).optional();
/** Số nguyên không âm, cho phép dấu phân cách "8.500" – server chuyển kiểu */
const statString = z.string().trim().regex(/^[\d.,\s]*$/, "Số liệu phải là số nguyên không âm").optional();

/** Schema form Cài đặt chung (giữ dạng chuỗi, server chuyển kiểu) */
export const settingsSchema = z.object({
  // Thông tin công ty
  companyName: text(200).min(2, "Vui lòng nhập tên công ty"),
  shortName: optionalText(50),
  slogan: optionalText(200),
  logo: z.string().nullable().optional(),
  licenseNumber: optionalText(100),
  licenseIssuer: optionalText(200),
  taxCode: optionalText(30),
  foundedYear: z
    .string()
    .trim()
    .regex(/^(\d{4})?$/, "Năm thành lập không hợp lệ (vd: 2012)")
    .refine((v) => !v || (Number(v) >= 1900 && Number(v) <= 2100), "Năm thành lập không hợp lệ (vd: 2012)")
    .optional(),
  // Liên hệ
  hotline: text(30).min(8, "Vui lòng nhập số hotline"),
  zalo: optionalText(30),
  email: z.union([z.literal(""), z.email("Email không hợp lệ")]).optional(),
  address: optionalText(300),
  mapEmbedUrl: optionalText(2000),
  workingHours: optionalText(200),
  // Mạng xã hội
  facebook: optionalUrl,
  youtube: optionalUrl,
  tiktok: optionalUrl,
  messenger: optionalUrl,
  // Số liệu nổi bật
  statWorkers: statString,
  statYears: statString,
  statPartners: statString,
  statMarkets: statString,
  // Giới thiệu
  aboutShort: optionalText(1000),
  /** HTML – nội dung trang giới thiệu */
  aboutContent: z.string().optional(),
  vision: optionalText(1000),
  mission: optionalText(1000),
  // Trang chủ – khối bảng đơn hàng theo chương trình
  jobTableTitle: optionalText(150),
  jobTableEnabled: z.boolean(),
  // SEO
  metaTitle: optionalText(160),
  metaDescription: optionalText(320),
  ogImage: z.string().nullable().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
