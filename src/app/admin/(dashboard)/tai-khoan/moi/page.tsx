import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { CreateUserForm } from "@/components/admin/users/user-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm tài khoản" };
export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader
        title="Thêm tài khoản"
        description="Tạo tài khoản đăng nhập trang quản trị cho nhân sự."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/tai-khoan"><ArrowLeft /> Quay lại</Link>
          </Button>
        }
      />
      <CreateUserForm />
    </>
  );
}
