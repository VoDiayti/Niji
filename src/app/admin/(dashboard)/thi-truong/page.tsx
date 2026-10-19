import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { ADMIN_PAGE_SIZE } from "@/lib/constants";
import { deleteMarket, toggleMarketActive, toggleMarketFeatured } from "@/actions/markets";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ListPagination } from "@/components/admin/list-pagination";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Thị trường" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function MarketsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const active = first(sp.active);
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where: Prisma.MarketWhereInput = {
    ...(q ? { OR: [{ name: { contains: q } }, { slug: { contains: q.toLowerCase() } }] } : {}),
    ...(active === "true" ? { isActive: true } : active === "false" ? { isActive: false } : {}),
  };

  const [markets, total] = await prisma.$transaction([
    prisma.market.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { _count: { select: { jobOrders: true } } },
    }),
    prisma.market.count({ where }),
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilter = Boolean(q || active);

  return (
    <>
      <PageHeader
        title="Thị trường"
        description={`${total} thị trường. Thị trường nổi bật sẽ hiển thị ở trang chủ.`}
        actions={
          <Button asChild>
            <Link href="/admin/thi-truong/moi"><Plus /> Thêm thị trường</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Tìm theo tên thị trường..." className="w-full sm:w-72" />
        <UrlParamSelect
          param="active"
          allLabel="Tất cả trạng thái"
          placeholder="Trạng thái"
          options={[
            { value: "true", label: "Đang hiển thị" },
            { value: "false", label: "Đang ẩn" },
          ]}
        />
      </div>

      {markets.length === 0 ? (
        <EmptyState
          title={hasFilter ? "Không tìm thấy thị trường phù hợp" : "Chưa có thị trường"}
          description={hasFilter ? "Thử đổi từ khóa hoặc bộ lọc." : "Thêm thị trường đầu tiên (Nhật Bản, Hàn Quốc, Đài Loan...)."}
          action={!hasFilter && <Button asChild><Link href="/admin/thi-truong/moi"><Plus /> Thêm thị trường</Link></Button>}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ảnh</TableHead>
                <TableHead>Thị trường</TableHead>
                <TableHead className="hidden w-28 text-center md:table-cell">Đơn hàng</TableHead>
                <TableHead className="w-24 text-center">Nổi bật</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="hidden w-20 text-center sm:table-cell">Thứ tự</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {markets.map((market) => (
                <TableRow key={market.id}>
                  <TableCell><Thumbnail src={market.image} className="w-20" /></TableCell>
                  <TableCell className="max-w-72 whitespace-normal">
                    <Link href={`/admin/thi-truong/${market.id}`} className="font-medium hover:underline">
                      {market.countryCode && <span className="mr-1.5 rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">{market.countryCode}</span>}
                      {market.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">/thi-truong/{market.slug}</p>
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    {market._count.jobOrders > 0 ? (
                      <Link href={`/admin/don-hang?market=${market.id}`}>
                        <Badge variant="secondary">{market._count.jobOrders} đơn</Badge>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={market.isFeatured} action={toggleMarketFeatured.bind(null, market.id)} label="Thị trường nổi bật" />
                  </TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={market.isActive} action={toggleMarketActive.bind(null, market.id)} label="Hiển thị thị trường" />
                  </TableCell>
                  <TableCell className="hidden text-center sm:table-cell">{market.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label="Sửa">
                        <Link href={`/admin/thi-truong/${market.id}`}><Pencil /></Link>
                      </Button>
                      <ConfirmDeleteButton
                        action={deleteMarket.bind(null, market.id)}
                        title={`Xóa thị trường "${market.name}"?`}
                        description={
                          market._count.jobOrders > 0
                            ? `Thị trường đang có ${market._count.jobOrders} đơn hàng. Hãy xóa hoặc chuyển đơn hàng sang thị trường khác trước.`
                            : "Các đăng ký tư vấn liên quan sẽ không còn gắn với thị trường này. Hành động không thể hoàn tác."
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

      <ListPagination page={page} totalPages={totalPages} className="mt-4" />
    </>
  );
}
