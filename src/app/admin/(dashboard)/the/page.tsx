import type { Metadata } from "next";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteTag } from "@/actions/tags";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { TagDialog } from "@/components/admin/tags/tag-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Thẻ" };
export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  const addButton = <TagDialog trigger={<Button><Plus /> Thêm thẻ</Button>} />;

  return (
    <>
      <PageHeader title="Thẻ (tag)" description={`${tags.length} thẻ – gắn nhãn chủ đề cho bài viết, mỗi bài có thể có nhiều thẻ.`} actions={addButton} />

      {tags.length === 0 ? (
        <EmptyState title="Chưa có thẻ nào" description="Thẻ cũng có thể được tạo nhanh ngay trong form viết bài." action={addButton} />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên thẻ</TableHead>
                <TableHead className="hidden sm:table-cell">Đường dẫn</TableHead>
                <TableHead className="text-center">Số bài viết</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">/tin-tuc/the/{t.slug}</TableCell>
                  <TableCell className="text-center">{t._count.posts}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                      <TagDialog tag={{ id: t.id, name: t.name, slug: t.slug }} trigger={<Button variant="ghost" size="icon" aria-label="Sửa" title="Sửa"><Pencil /></Button>} />
                      <ConfirmDeleteButton
                        action={deleteTag.bind(null, t.id)}
                        title="Xóa thẻ?"
                        description={
                          t._count.posts > 0
                            ? `Thẻ "${t.name}" sẽ bị gỡ khỏi ${t._count.posts} bài viết (bài viết không bị xóa).`
                            : `Thẻ "${t.name}" sẽ bị xóa. Hành động này không thể hoàn tác.`
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
