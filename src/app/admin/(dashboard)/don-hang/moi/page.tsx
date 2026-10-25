import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { asc } from "drizzle-orm";
import { db, jobOrders, markets } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { JobForm } from "@/components/admin/jobs/job-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm đơn hàng" };
export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const [marketOptions, industryRows] = await Promise.all([
    db.select({ id: markets.id, name: markets.name }).from(markets).orderBy(asc(markets.order), asc(markets.name)),
    db.selectDistinct({ industry: jobOrders.industry }).from(jobOrders).orderBy(asc(jobOrders.industry)),
  ]);

  return (
    <>
      <PageHeader
        title="Thêm đơn hàng"
        description="Tạo đơn hàng tuyển dụng mới."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/don-hang"><ArrowLeft /> Quay lại</Link>
          </Button>
        }
      />
      <JobForm markets={marketOptions} industries={industryRows.map((r) => r.industry)} />
    </>
  );
}
