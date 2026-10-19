import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { ChangePasswordForm } from "@/components/admin/users/change-password-form";

export const metadata: Metadata = { title: "Đổi mật khẩu" };
export const dynamic = "force-dynamic";

/** Trang dành cho mọi vai trò (không yêu cầu Quản trị viên) */
export default async function ChangePasswordPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Đổi mật khẩu" description={`Tài khoản: ${user.email}`} />
      <ChangePasswordForm />
    </>
  );
}
