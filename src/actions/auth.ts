"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { ADMIN_LOGIN_PATH } from "@/auth.config";

const loginSchema = z.object({
  email: z.email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  callbackUrl: z.string().optional(),
});

export type LoginState = { error?: string } | undefined;

/** Server action đăng nhập admin (dùng với useActionState) */
export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };

  const { email, password, callbackUrl } = parsed.data;
  // Chỉ cho phép quay lại các trang trong /admin để tránh open redirect
  const redirectTo = callbackUrl && callbackUrl.startsWith("/admin") && !callbackUrl.startsWith(ADMIN_LOGIN_PATH) ? callbackUrl : "/admin";

  try {
    await signIn("credentials", { email: email.trim().toLowerCase(), password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: error.type === "CredentialsSignin" ? "Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa." : "Không thể đăng nhập, vui lòng thử lại.",
      };
    }
    throw error; // redirect của Next.js
  }
  return undefined;
}

export async function logoutAction() {
  await signOut({ redirectTo: ADMIN_LOGIN_PATH });
}
