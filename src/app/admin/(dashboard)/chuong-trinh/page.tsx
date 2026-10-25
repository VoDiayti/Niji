import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { asc, count, eq, getTableColumns } from "drizzle-orm";
import { db, jobOrders, jobPrograms } from "@/db";
import { deleteJobProgram, toggleJobProgramActive } from "@/actions/job-programs";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { JobProgramDialog } from "@/components/admin/job-programs/job-program-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Chương trình (tab đơn hàng)" };
export const dynamic = "force-dynamic";

export default async function JobProgramsPage() {
  // Số đơn hàng đang gắn vào mỗi chương trình: leftJoin + count + groupBy (programId không có FK)
  const rows = await db
    .select({ ...getTableColumns(jobPrograms), jobCount: count(jobOrders.id) })
    .from(jobPrograms)
    .leftJoin(jobOrders, eq(jobOrders.programId, jobPrograms.id))
    .groupBy(jobPrograms.id)
    .orderBy(asc(jobPrograms.order), asc(jobPrograms.name));

  const addButton = (
    <JobProgramDialog trigger={<Button><Plus /> Thêm chương trình</Button>} />
  );

  return (
    <>
      <PageHeader
        title="Chương trình (tab đơn hàng)"
        description={`${rows.length} chương trình – mỗi chương trình là một tab trong bảng đơn hàng ở trang chủ. Chỉ đơn hàng “Đang tuyển” có gắn chương trình mới hiện trong bảng.`}
        actions={addButton}
      />
      <p className="-mt-3 mb-4 text-sm text-muted-foreground">
        Bật/tắt cả khối và tiêu đề bảng chỉnh trong <Link href="/admin/cai-dat" className="font-medium underline underline-offset-4">Cài đặt chung → Trang chủ</Link>.
        Gắn đơn hàng vào chương trình khi tạo/sửa <Link href="/admin/don-hang" className="font-medium underline underline-offset-4">đơn hàng</Link>.
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có chương trình nào"
          description="Tạo chương trình để nhóm đơn hàng thành các tab ở trang chủ, ví dụ: Thực tập sinh Nhật Bản, Kỹ năng đặc định, Điều dưỡng, EPS Hàn Quốc."
          action={addButton}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên chương trình</TableHead>
                <TableHead className="hidden md:table-cell">Đường dẫn (slug)</TableHead>
                <TableHead className="text-center">Số đơn hàng</TableHead>
                <TableHead className="hidden text-center sm:table-cell">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-24 text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const data = { id: p.id, name: p.name, slug: p.slug, description: p.description, order: p.order, isActive: p.isActive };
                return (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-xs whitespace-normal md:max-w-md">
                      <p className="font-medium">{p.name}</p>
                      {p.description && <p className="line-clamp-1 text-xs text-muted-foreground">{p.description}</p>}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{p.slug}</TableCell>
                    <TableCell className="text-center">
                      {p.jobCount > 0 ? (
                        <Link href={`/admin/don-hang?program=${p.id}`} className="font-medium tabular-nums hover:underline" title="Xem các đơn hàng thuộc chương trình">
                          {p.jobCount}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-center sm:table-cell">{p.order}</TableCell>
                    <TableCell className="text-center">
                      <ToggleSwitch checked={p.isActive} action={toggleJobProgramActive.bind(null, p.id)} label="Hiển thị tab trên trang chủ" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                        <JobProgramDialog program={data} trigger={<Button variant="ghost" size="icon" aria-label="Sửa" title="Sửa"><Pencil /></Button>} />
                        <ConfirmDeleteButton
                          action={deleteJobProgram.bind(null, p.id)}
                          title="Xóa chương trình?"
                          description={
                            p.jobCount > 0
                              ? `Chương trình "${p.name}" sẽ bị xóa. ${p.jobCount} đơn hàng đang gắn vào chương trình này KHÔNG bị xóa, nhưng sẽ không còn hiển thị trong bảng đơn hàng ở trang chủ cho đến khi được gắn chương trình khác.`
                              : `Chương trình "${p.name}" sẽ bị xóa. Hành động này không thể hoàn tác.`
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
