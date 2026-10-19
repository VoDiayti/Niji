import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Pencil, UserPlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDateTime, timeAgo } from "@/lib/format";
import { deleteUser } from "@/actions/users";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Tài khoản admin" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <>
      <PageHeader
        title="Tài khoản admin"
        description={`${users.length} tài khoản, ${adminCount} Quản trị viên. Chỉ Quản trị viên mới xem được trang này.`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/tai-khoan/doi-mat-khau"><KeyRound /> Đổi mật khẩu của tôi</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/tai-khoan/moi"><UserPlus /> Thêm tài khoản</Link>
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden lg:table-cell">Đăng nhập lần cuối</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === me.id;
              const isLastAdmin = user.role === "ADMIN" && adminCount <= 1;
              return (
                <TableRow key={user.id}>
                  <TableCell className="max-w-56 whitespace-normal">
                    <Link href={`/admin/tai-khoan/${user.id}`} className="font-medium hover:underline">{user.name}</Link>
                    {isSelf && <Badge variant="outline" className="ml-2">Bạn</Badge>}
                    <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{ROLE_LABELS[user.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={user.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}>
                      {user.isActive ? "Hoạt động" : "Đã khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {user.lastLoginAt ? (
                      <span title={formatDateTime(user.lastLoginAt)}>{timeAgo(user.lastLoginAt)}</span>
                    ) : (
                      "Chưa đăng nhập"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="Sửa">
                        <Link href={`/admin/tai-khoan/${user.id}`}><Pencil /></Link>
                      </Button>
                      {!isSelf && !isLastAdmin && (
                        <ConfirmDeleteButton
                          action={deleteUser.bind(null, user.id)}
                          title={`Xóa tài khoản "${user.name}"?`}
                          description="Người này sẽ không thể đăng nhập nữa. Bài viết họ đã tạo vẫn được giữ lại."
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
