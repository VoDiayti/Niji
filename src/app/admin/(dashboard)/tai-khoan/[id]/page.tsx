import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { requireAdmin } from "@/lib/auth-guard";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { EditUserForm } from "@/components/admin/users/user-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sửa tài khoản" };
export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
  if (!user) notFound();

  return (
    <>
      <PageHeader
        title={user.name}
        description={`Tạo ${formatDateTime(user.createdAt)} · Đăng nhập lần cuối: ${user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "chưa đăng nhập"}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/tai-khoan"><ArrowLeft /> Quay lại</Link>
          </Button>
        }
      />
      <EditUserForm user={user} isSelf={user.id === me.id} />
    </>
  );
}
