import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE, GENDER_LABELS, JOB_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { deleteJob, toggleJobFeatured } from "@/actions/jobs";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { JobStatusToggle } from "@/components/admin/jobs/job-status-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Đơn hàng tuyển dụng" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const market = first(sp.market) ?? "";
  const status = first(sp.status);
  const industry = first(sp.industry) ?? "";
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where: Prisma.JobOrderWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { industry: { contains: q } },
            { location: { contains: q } },
          ],
        }
      : {}),
    ...(market ? { marketId: market } : {}),
    ...(status === "OPEN" || status === "CLOSED" ? { status } : {}),
    ...(industry ? { industry } : {}),
  };

  const [jobs, total, markets, industryRows] = await Promise.all([
    prisma.jobOrder.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { market: { select: { id: true, name: true } } },
    }),
    prisma.jobOrder.count({ where }),
    prisma.market.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.jobOrder.findMany({ distinct: ["industry"], select: { industry: true }, orderBy: { industry: "asc" } }),
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilter = Boolean(q || market || status || industry);

  return (
    <>
      <PageHeader
        title="Đơn hàng tuyển dụng"
        description={`${total} đơn hàng. Chỉ đơn hàng “Đang tuyển” hiển thị trên website.`}
        actions={
          <Button asChild>
            <Link href="/admin/don-hang/moi"><Plus /> Thêm đơn hàng</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Tìm theo tiêu đề, ngành, nơi làm việc..." className="w-full sm:w-72" />
        <UrlParamSelect param="market" allLabel="Tất cả thị trường" placeholder="Thị trường" options={markets.map((m) => ({ value: m.id, label: m.name }))} />
        <UrlParamSelect
          param="status"
          allLabel="Tất cả trạng thái"
          placeholder="Trạng thái"
          options={Object.entries(JOB_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <UrlParamSelect param="industry" allLabel="Tất cả ngành" placeholder="Ngành nghề" options={industryRows.map((r) => ({ value: r.industry, label: r.industry }))} />
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title={hasFilter ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có đơn hàng"}
          description={hasFilter ? "Thử đổi từ khóa hoặc bộ lọc." : "Thêm đơn hàng tuyển dụng đầu tiên."}
          action={!hasFilter && <Button asChild><Link href="/admin/don-hang/moi"><Plus /> Thêm đơn hàng</Link></Button>}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ảnh</TableHead>
                <TableHead>Đơn hàng</TableHead>
                <TableHead className="hidden lg:table-cell">Thị trường / Ngành</TableHead>
                <TableHead className="hidden text-center xl:table-cell">SL</TableHead>
                <TableHead className="hidden xl:table-cell">Giới tính / Tuổi</TableHead>
                <TableHead className="hidden md:table-cell">Lương</TableHead>
                <TableHead className="hidden lg:table-cell">Hạn nộp</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-20 text-center">Nổi bật</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const expired = job.deadline && job.deadline < new Date();
                return (
                  <TableRow key={job.id}>
                    <TableCell><Thumbnail src={job.image} className="w-20" /></TableCell>
                    <TableCell className="max-w-72 whitespace-normal">
                      <Link href={`/admin/don-hang/${job.id}`} className="line-clamp-2 font-medium hover:underline">{job.title}</Link>
                      <p className="text-xs text-muted-foreground lg:hidden">{job.market.name} · {job.industry}</p>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal lg:table-cell">
                      <p>{job.market.name}</p>
                      <p className="text-xs text-muted-foreground">{job.industry}</p>
                    </TableCell>
                    <TableCell className="hidden text-center xl:table-cell">{job.quantity}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <p>{GENDER_LABELS[job.gender]}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.ageMin != null || job.ageMax != null ? `${job.ageMin ?? "?"} – ${job.ageMax ?? "?"} tuổi` : "—"}
                      </p>
                    </TableCell>
                    <TableCell className="hidden max-w-44 whitespace-normal md:table-cell">
                      <p className="line-clamp-2 text-sm">{job.salaryText || "—"}</p>
                    </TableCell>
                    <TableCell className={`hidden lg:table-cell ${expired ? "text-destructive" : ""}`}>
                      {job.deadline ? formatDate(job.deadline) : "—"}
                    </TableCell>
                    <TableCell><JobStatusToggle id={job.id} status={job.status} /></TableCell>
                    <TableCell className="text-center">
                      <ToggleSwitch checked={job.isFeatured} action={toggleJobFeatured.bind(null, job.id)} label="Đơn hàng nổi bật" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild aria-label="Sửa">
                          <Link href={`/admin/don-hang/${job.id}`}><Pencil /></Link>
                        </Button>
                        <ConfirmDeleteButton
                          action={deleteJob.bind(null, job.id)}
                          title="Xóa đơn hàng này?"
                          description={`Đơn hàng "${job.title}" sẽ bị xóa khỏi website. Các đăng ký ứng tuyển liên quan vẫn được giữ lại.`}
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

      <ListPagination page={page} totalPages={totalPages} className="mt-4" />
    </>
  );
}
