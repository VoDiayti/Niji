// Cấu hình Auth.js dùng chung cho proxy (không import Prisma để giữ proxy nhẹ)
import type { NextAuthConfig } from "next-auth";

export const ADMIN_LOGIN_PATH = "/admin/dang-nhap";

export const authConfig = {
  pages: { signIn: ADMIN_LOGIN_PATH },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 ngày
  trustHost: true,
  providers: [], // Credentials được thêm trong src/auth.ts
  callbacks: {
    // Bảo vệ toàn bộ /admin: chưa đăng nhập → chuyển về trang đăng nhập
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith(ADMIN_LOGIN_PATH);
      if (isLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL("/admin", nextUrl));
        return true;
      }
      if (nextUrl.pathname.startsWith("/admin")) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
