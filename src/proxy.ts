// Next.js 16 proxy (thay cho middleware) – bảo vệ khu vực /admin và giới hạn số lần đăng nhập.
// Chỉ giải mã JWT phiên của Auth.js (next-auth/jwt) thay vì nạp cả NextAuth để bundle middleware nhỏ (gói Workers Free giới hạn 3 MiB).
import { NextResponse, type NextRequest } from "next/server";
import { decode } from "next-auth/jwt";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ADMIN_LOGIN_PATH } from "@/auth.config";
import { getAuthSecret } from "@/lib/auth-secret";

const SESSION_COOKIES = ["__Secure-authjs.session-token", "authjs.session-token"] as const;

/** Đọc phiên đăng nhập từ cookie (salt của JWT = tên cookie, giống Auth.js) */
async function readSession(request: NextRequest, secret: string): Promise<{ role?: unknown } | null> {
  for (const name of SESSION_COOKIES) {
    const token = request.cookies.get(name)?.value;
    if (!token) continue;
    try {
      const payload = await decode({ token, secret, salt: name });
      if (payload) return payload;
    } catch {
      // token không hợp lệ/hết hạn → coi như chưa đăng nhập
    }
  }
  return null;
}

/** Giới hạn đăng nhập: 5 lần / 60 giây mỗi IP (binding Rate Limiting, bỏ qua nếu không có) */
async function loginAllowed(request: NextRequest): Promise<boolean> {
  try {
    const limiter = getCloudflareContext().env.LEAD_RATE_LIMITER;
    if (!limiter) return true;
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const { success } = await limiter.limit({ key: `login:${ip}` });
    return success;
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    if (!(await loginAllowed(request))) {
      return new NextResponse("Bạn đăng nhập sai quá nhiều lần, vui lòng thử lại sau 1 phút.", { status: 429 });
    }
    return NextResponse.next();
  }

  const secret = await getAuthSecret();
  const session = secret ? await readSession(request, secret) : null;
  const isLoginPage = pathname.startsWith(ADMIN_LOGIN_PATH);

  if (isLoginPage) {
    return session ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!session) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/callback/credentials"],
};
