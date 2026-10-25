import type { Metadata } from "next";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { asc, count, desc, eq } from "drizzle-orm";
import { db, jobOrders, leads, markets } from "@/db";
import { ADMIN_PAGE_SIZE, LEAD_STATUS_LABELS, LEAD_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime, telHref } from "@/lib/format";
import { leadFilterWhere, parseLeadFilter } from "@/lib/validations/lead-admin";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Đăng ký tư vấn" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filter = parseLeadFilter(sp);
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const where = leadFilterWhere(filter);

  const [items, [{ total }], marketOptions, job] = await Promise.all([
    db.query.leads.findMany({
      where,
      orderBy: [desc(leads.createdAt)],
      limit: ADMIN_PAGE_SIZE,
      offset: (page - 1) * ADMIN_PAGE_SIZE,
      with: { market: { columns: { name: true } }, jobOrder: { columns: { title: true } } },
    }),
    db.select({ total: count() }).from(leads).where(where),
    db.select({ id: markets.id, name: markets.name }).from(markets).orderBy(asc(markets.order), asc(markets.name)),
    filter.job ? db.query.jobOrders.findFirst({ columns: { title: true }, where: eq(jobOrders.id, filter.job) }) : null,
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilter = Boolean(filter.q || filter.status || filter.type || filter.market || filter.job);

  // Link xuất CSV giữ nguyên bộ lọc hiện tại
  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) if (v) exportParams.set(k, v);
  const exportHref = `/api/admin/dang-ky/export${exportParams.size ? `?${exportParams.toString()}` : ""}`;

  return (
    <>
      <PageHeader
        title="Đăng ký tư vấn"
        description={`${total} đăng ký${hasFilter ? " (theo bộ lọc)" : ""}. Liên hệ sớm với các đăng ký “Mới”.`}
        actions={
          <Button variant="outline" asChild>
            <a href={exportHref} download><Download /> Xuất CSV</a>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Tìm theo tên, số điện thoại, email..." className="w-full sm:w-72" />
        <UrlParamSelect
          param="status"
          allLabel="Tất cả trạng thái"
          placeholder="Trạng thái"
          options={Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <UrlParamSelect
          param="type"
          allLabel="Tất cả loại"
          placeholder="Loại đăng ký"
          options={Object.entries(LEAD_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <UrlParamSelect param="market" allLabel="Tất cả thị trường" placeholder="Thị trường" options={marketOptions.map((m) => ({ value: m.id, label: m.name }))} />
        {job && (
          <Badge variant="secondary" className="h-9 gap-1 px-3">
            Đơn hàng: <span className="max-w-48 truncate">{job.title}</span>
            <Link href="/admin/dang-ky" className="ml-1 underline">Bỏ lọc</Link>
          </Badge>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={hasFilter ? "Không có đăng ký phù hợp" : "Chưa có đăng ký nào"}
          description={hasFilter ? "Thử đổi từ khóa hoặc bộ lọc." : "Khi khách gửi form tư vấn / ứng tuyển / liên hệ trên website, dữ liệu sẽ xuất hiện ở đây."}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ tên</TableHead>
                <TableHead>Điện thoại</TableHead>
                <TableHead className="hidden md:table-cell">Loại</TableHead>
                <TableHead className="hidden lg:table-cell">Quan tâm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
                <TableHead className="w-16 text-right">Xem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((lead) => (
                <TableRow key={lead.id} className={lead.status === "NEW" ? "bg-blue-50/40" : undefined}>
                  <TableCell className="max-w-48 whitespace-normal font-medium">
                    <Link href={`/admin/dang-ky/${lead.id}`} className="hover:underline">{lead.fullName}</Link>
                    {lead.hometown && <p className="text-xs font-normal text-muted-foreground">{lead.hometown}</p>}
                  </TableCell>
                  <TableCell>
                    <a href={telHref(lead.phone)} className="font-medium text-primary hover:underline">{lead.phone}</a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{LEAD_TYPE_LABELS[lead.type]}</TableCell>
                  <TableCell className="hidden max-w-56 whitespace-normal lg:table-cell">
                    <p className="line-clamp-2">{lead.jobOrder?.title ?? lead.market?.name ?? <span className="text-muted-foreground">—</span>}</p>
                  </TableCell>
                  <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDateTime(lead.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild aria-label="Xem chi tiết">
                      <Link href={`/admin/dang-ky/${lead.id}`}><Eye /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ListPagination page={page} totalPages={totalPages} className="mt-4" />
    </>
  );
}
