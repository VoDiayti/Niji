// Next.js 16 proxy (thay cho middleware) – bảo vệ khu vực /admin
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { getAuthSecret } from "@/lib/auth-secret";

// Cấu hình "lười": secret được đọc theo từng request (cần thiết trên Cloudflare Workers)
const { auth } = NextAuth(async () => ({ ...authConfig, secret: await getAuthSecret() }));

// Next.js yêu cầu export tên `proxy` là một hàm
export const proxy = auth;

export const config = {
  matcher: ["/admin/:path*"],
};
