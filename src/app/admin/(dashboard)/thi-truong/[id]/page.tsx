import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { count, eq } from "drizzle-orm";
import { db, jobOrders, markets } from "@/db";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { MarketForm } from "@/components/admin/markets/market-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sửa thị trường" };
export const dynamic = "force-dynamic";

export default async function EditMarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [market, [{ jobCount }]] = await Promise.all([
    db.query.markets.findFirst({ where: eq(markets.id, id) }),
    db.select({ jobCount: count() }).from(jobOrders).where(eq(jobOrders.marketId, id)),
  ]);
  if (!market) notFound();

  return (
    <>
      <PageHeader
        title={market.name}
        description={`${jobCount} đơn hàng · Cập nhật ${formatDateTime(market.updatedAt)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/thi-truong"><ArrowLeft /> Quay lại</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/thi-truong/${market.slug}`} target="_blank"><ExternalLink /> Xem trang</Link>
            </Button>
          </>
        }
      />
      <MarketForm initialData={market} />
    </>
  );
}
