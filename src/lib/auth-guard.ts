import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ADMIN_LOGIN_PATH } from "@/auth.config";
import type { Role } from "@/generated/prisma/enums";

export type SessionUser = { id: string; name?: string | null; email?: string | null; role: Role };

/** Lấy user đang đăng nhập (null nếu chưa đăng nhập). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role };
}

/** Dùng trong page/layout admin: chưa đăng nhập → chuyển hướng. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(ADMIN_LOGIN_PATH);
  return user;
}

/** Dùng trong page admin chỉ dành cho Quản trị viên. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/admin?error=forbidden");
  return user;
}

export class UnauthorizedError extends Error {
  constructor(message = "Bạn cần đăng nhập để thực hiện thao tác này.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Dùng trong server action: trả về user hoặc ném UnauthorizedError. */
export async function assertUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Dùng trong server action chỉ dành cho Quản trị viên. */
export async function assertAdmin(): Promise<SessionUser> {
  const user = await assertUser();
  if (user.role !== "ADMIN") throw new UnauthorizedError("Chỉ Quản trị viên mới có quyền thực hiện thao tác này.");
  return user;
}
