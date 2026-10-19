"use server";

import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
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
  return prisma.user.count({ where: { role: "ADMIN", isActive: true, id: { not: excludeId } } });
}

export async function createUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertAdmin();
    const parsed = createUserSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const { name, email, password, role } = parsed.data;

    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) return fail("Email này đã được sử dụng", { email: ["Email này đã được sử dụng"] });

    const user = await prisma.user.create({
      data: { name, email, role, passwordHash: await hashPassword(password) },
    });
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

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
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

    await prisma.user.update({
      where: { id },
      data: { name, role, isActive, ...(password ? { passwordHash: await hashPassword(password) } : {}) },
    });
    revalidateUserPages(id);
    return ok({ id }, password ? "Đã lưu tài khoản và đặt lại mật khẩu" : "Đã lưu tài khoản");
  });
}

export async function deleteUser(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    const me = await assertAdmin();
    if (id === me.id) return fail("Bạn không thể xóa tài khoản đang đăng nhập");

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target) return fail("Không tìm thấy tài khoản");
    if (target.role === "ADMIN") {
      const otherAdmins = await prisma.user.count({ where: { role: "ADMIN", id: { not: id } } });
      if (otherAdmins === 0) return fail("Không thể xóa tài khoản Quản trị viên cuối cùng");
    }

    await prisma.user.delete({ where: { id } });
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

    const user = await prisma.user.findUnique({ where: { id: me.id }, select: { passwordHash: true } });
    if (!user) return fail("Không tìm thấy tài khoản");

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return fail("Mật khẩu hiện tại không đúng", { currentPassword: ["Mật khẩu hiện tại không đúng"] });

    await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
    return ok(undefined, "Đã đổi mật khẩu thành công");
  });
}
