"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, ne } from "drizzle-orm";
import { db, users } from "@/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { assertAdmin, assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { changePasswordSchema, createUserSchema, updateUserSchema } from "@/lib/validations/user";

const ADMIN_PATH = "/admin/tai-khoan";

function revalidateUserPages(id?: string) {
  revalidatePath(ADMIN_PATH);
  if (id) revalidatePath(`${ADMIN_PATH}/${id}`);
}

/** Số Quản trị viên đang hoạt động, không tính tài khoản `excludeId` */
async function countOtherActiveAdmins(excludeId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(users)
    .where(and(eq(users.role, "ADMIN"), eq(users.isActive, true), ne(users.id, excludeId)));
  return total;
}

export async function createUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertAdmin();
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const { name, email, password, role } = parsed.data;

    const exists = await db.query.users.findFirst({ columns: { id: true }, where: eq(users.email, email) });
    if (exists) return fail("Email này đã được sử dụng", { email: ["Email này đã được sử dụng"] });

    const [user] = await db
      .insert(users)
      .values({ name, email, role, passwordHash: await hashPassword(password) })
      .returning({ id: users.id });
    revalidateUserPages();
    return ok({ id: user.id }, "Đã tạo tài khoản");
  });
}

export async function updateUser(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    const me = await assertAdmin();
    const parsed = updateUserSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const { name, role, isActive, password } = parsed.data;

    const target = await db.query.users.findFirst({ columns: { id: true, role: true, isActive: true }, where: eq(users.id, id) });
    if (!target) return fail("Không tìm thấy tài khoản");

    if (target.id === me.id) {
      if (!isActive) return fail("Bạn không thể tự khóa tài khoản của chính mình");
      if (role !== "ADMIN") return fail("Bạn không thể tự hạ quyền của chính mình");
    }
    // Không để hệ thống mất Quản trị viên cuối cùng
    if (target.role === "ADMIN" && target.isActive && (role !== "ADMIN" || !isActive)) {
      if ((await countOtherActiveAdmins(target.id)) === 0) {
        return fail("Không thể khóa hoặc hạ quyền Quản trị viên duy nhất của hệ thống");
      }
    }

    await db
      .update(users)
      .set({ name, role, isActive, ...(password ? { passwordHash: await hashPassword(password) } : {}) })
      .where(eq(users.id, id));
    revalidateUserPages(id);
    return ok({ id }, password ? "Đã lưu tài khoản và đặt lại mật khẩu" : "Đã lưu tài khoản");
  });
}

export async function deleteUser(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const me = await assertAdmin();
    if (id === me.id) return fail("Bạn không thể xóa tài khoản đang đăng nhập");

    const target = await db.query.users.findFirst({ columns: { id: true, role: true }, where: eq(users.id, id) });
    if (!target) return fail("Không tìm thấy tài khoản");
    if (target.role === "ADMIN") {
      const [{ otherAdmins }] = await db
        .select({ otherAdmins: count() })
        .from(users)
        .where(and(eq(users.role, "ADMIN"), ne(users.id, id)));
      if (otherAdmins === 0) return fail("Không thể xóa tài khoản Quản trị viên cuối cùng");
    }

    await db.delete(users).where(eq(users.id, id));
    revalidateUserPages();
    return ok(undefined, "Đã xóa tài khoản");
  });
}

/** Người dùng (mọi vai trò) tự đổi mật khẩu của mình */
export async function changeOwnPassword(input: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    const me = await assertUser();
    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const user = await db.query.users.findFirst({ columns: { passwordHash: true }, where: eq(users.id, me.id) });
    if (!user) return fail("Không tìm thấy tài khoản");

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return fail("Mật khẩu hiện tại không đúng", { currentPassword: ["Mật khẩu hiện tại không đúng"] });

    await db.update(users).set({ passwordHash: await hashPassword(parsed.data.newPassword) }).where(eq(users.id, me.id));
    return ok(undefined, "Đã đổi mật khẩu thành công");
  });
}
