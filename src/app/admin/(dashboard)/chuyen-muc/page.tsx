import type { Metadata } from "next";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "@/actions/categories";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ActiveBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { CategoryDialog } from "@/components/admin/categories/category-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Chuyên mục" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });

  const addButton = (
    <CategoryDialog trigger={<Button><Plus /> Thêm chuyên mục</Button>} />
  );

  return (
    <>
      <PageHeader title="Chuyên mục" description={`${categories.length} chuyên mục – nhóm bài viết theo chủ đề trong mục Tin tức.`} actions={addButton} />

      {categories.length === 0 ? (
        <EmptyState title="Chưa có chuyên mục nào" description="Tạo chuyên mục để phân loại bài viết, ví dụ: Tin tức XKLĐ, Kinh nghiệm, Chính sách." action={addButton} />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chuyên mục</TableHead>
                <TableHead className="hidden md:table-cell">Đường dẫn</TableHead>
                <TableHead className="text-center">Số bài viết</TableHead>
                <TableHead className="hidden text-center sm:table-cell">Thứ tự</TableHead>
                <TableHead>Hiển thị</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => {
                const data = { id: c.id, name: c.name, slug: c.slug, description: c.description, order: c.order, isActive: c.isActive };
                return (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-xs whitespace-normal md:max-w-md">
                      <p className="font-medium">{c.name}</p>
                      {c.description && <p className="line-clamp-1 text-xs text-muted-foreground">{c.description}</p>}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">/tin-tuc/chuyen-muc/{c.slug}</TableCell>
                    <TableCell className="text-center">{c._count.posts}</TableCell>
                    <TableCell className="hidden text-center sm:table-cell">{c.order}</TableCell>
                    <TableCell><ActiveBadge active={c.isActive} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <CategoryDialog category={data} trigger={<Button variant="ghost" size="icon" aria-label="Sửa" title="Sửa"><Pencil /></Button>} />
                        <ConfirmDeleteButton
                          action={deleteCategory.bind(null, c.id)}
                          title="Xóa chuyên mục?"
                          description={
                            c._count.posts > 0
                              ? `Chuyên mục "${c.name}" sẽ bị xóa. ${c._count.posts} bài viết thuộc chuyên mục này KHÔNG bị xóa mà sẽ chuyển về "Chưa phân loại".`
                              : `Chuyên mục "${c.name}" sẽ bị xóa. Hành động này không thể hoàn tác.`
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
