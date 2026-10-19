import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { JobForm } from "@/components/admin/jobs/job-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm đơn hàng" };
export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const [markets, industryRows] = await Promise.all([
    prisma.market.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.jobOrder.findMany({ distinct: ["industry"], select: { industry: true }, orderBy: { industry: "asc" } }),
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
      <JobForm markets={markets} industries={industryRows.map((r) => r.industry)} />
    </>
  );
}
