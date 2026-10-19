import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Image as ImageIcon, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE, PROGRAM_TYPE_LABELS } from "@/lib/constants";
import { deleteProgram } from "@/actions/programs";
import type { Prisma } from "@/generated/prisma/client";
import type { ProgramType } from "@/generated/prisma/enums";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { ListPagination } from "@/components/admin/list-pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ActiveBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Du học – Đào tạo" };
export const dynamic = "force-dynamic";

function isProgramType(value: string | undefined): value is ProgramType {
  return !!value && value in PROGRAM_TYPE_LABELS;
}

export default async function ProgramsPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const type = isProgramType(sp.type) ? sp.type : undefined;

  const where: Prisma.TrainingProgramWhereInput = {
    ...(q ? { title: { contains: q } } : {}),
    ...(type ? { type } : {}),
  };

  const [programs, total] = await prisma.$transaction([
    prisma.trainingProgram.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: { id: true, title: true, slug: true, type: true, image: true, duration: true, tuition: true, order: true, isActive: true },
    }),
    prisma.trainingProgram.count({ where }),
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilters = Boolean(q || type);

  return (
    <>
      <PageHeader
        title="Du học – Đào tạo"
        description={`${total} chương trình${hasFilters ? " phù hợp bộ lọc" : ""} du học nghề, đào tạo tiếng và kỹ năng nghề.`}
        actions={
          <Button asChild>
            <Link href="/admin/dao-tao/moi"><Plus /> Thêm chương trình</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Tìm theo tiêu đề..." className="w-full sm:w-72" />
        <UrlParamSelect
          param="type"
          allLabel="Tất cả loại"
          placeholder="Loại chương trình"
          options={Object.entries(PROGRAM_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          className="w-full sm:w-52"
        />
      </div>

      {programs.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Không tìm thấy chương trình phù hợp" : "Chưa có chương trình nào"}
          description={hasFilters ? "Thử đổi từ khóa hoặc bỏ bộ lọc." : "Thêm chương trình du học nghề, khóa tiếng hoặc đào tạo kỹ năng để hiển thị trên website."}
          action={!hasFilters && <Button asChild><Link href="/admin/dao-tao/moi"><Plus /> Thêm chương trình</Link></Button>}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="hidden lg:table-cell">Thời lượng</TableHead>
                <TableHead className="hidden text-center sm:table-cell">Thứ tự</TableHead>
                <TableHead>Hiển thị</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL ảnh bất kỳ trong admin
                      <img src={p.image} alt="" className="h-10 w-16 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal md:max-w-md">
                    <Link href={`/admin/dao-tao/${p.id}`} className="line-clamp-2 font-medium hover:underline">{p.title}</Link>
                    <p className="truncate text-xs text-muted-foreground">/du-hoc-dao-tao/{p.slug}</p>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{PROGRAM_TYPE_LABELS[p.type]}</Badge></TableCell>
                  <TableCell className="hidden max-w-48 truncate lg:table-cell">{p.duration ?? "—"}</TableCell>
                  <TableCell className="hidden text-center sm:table-cell">{p.order}</TableCell>
                  <TableCell><ActiveBadge active={p.isActive} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/dao-tao/${p.id}`} aria-label="Sửa" title="Sửa"><Pencil /></Link>
                      </Button>
                      {p.isActive && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/du-hoc-dao-tao/${p.slug}`} target="_blank" aria-label="Xem trên website" title="Xem trên website"><ExternalLink /></Link>
                        </Button>
                      )}
                      <ConfirmDeleteButton
                        action={deleteProgram.bind(null, p.id)}
                        title="Xóa chương trình?"
                        description={`Chương trình "${p.title}" sẽ bị xóa vĩnh viễn khỏi website. Hành động này không thể hoàn tác.`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ListPagination page={page} totalPages={totalPages} className="mt-6" />
    </>
  );
}
