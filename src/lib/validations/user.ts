import { z } from "zod";

export const USER_ROLES = ["ADMIN", "EDITOR"] as const;

const name = z.string().trim().min(2, "Vui lòng nhập họ tên").max(100, "Họ tên tối đa 100 ký tự");
const email = z.string().trim().toLowerCase().pipe(z.email("Email không hợp lệ"));
const password = z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự");
const role = z.enum(USER_ROLES, "Vui lòng chọn vai trò");

/** Tạo tài khoản mới (chỉ Quản trị viên) */
export const createUserSchema = z.object({
  name,
  email,
  password,
  role,
});
export type CreateUserValues = z.infer<typeof createUserSchema>;

/** Sửa tài khoản: mật khẩu để trống nếu không đổi */
export const updateUserSchema = z.object({
  name,
  role,
  isActive: z.boolean(),
  password: z.union([z.literal(""), password]).optional(),
});
export type UpdateUserValues = z.infer<typeof updateUserSchema>;

/** Người dùng tự đổi mật khẩu */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: password,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Mật khẩu xác nhận không khớp" })
  .refine((d) => d.newPassword !== d.currentPassword, { path: ["newPassword"], message: "Mật khẩu mới phải khác mật khẩu hiện tại" });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
