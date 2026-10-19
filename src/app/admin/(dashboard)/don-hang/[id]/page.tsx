import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { JobForm } from "@/components/admin/jobs/job-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sửa đơn hàng" };
export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, markets, industryRows] = await Promise.all([
    prisma.jobOrder.findUnique({ where: { id }, include: { _count: { select: { leads: true } } } }),
    prisma.market.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.jobOrder.findMany({ distinct: ["industry"], select: { industry: true }, orderBy: { industry: "asc" } }),
  ]);
  if (!job) notFound();

  return (
    <>
      <PageHeader
        title={job.title}
        description={`${job._count.leads} lượt ứng tuyển · ${job.viewCount} lượt xem · Cập nhật ${formatDateTime(job.updatedAt)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/don-hang"><ArrowLeft /> Quay lại</Link>
            </Button>
            {job._count.leads > 0 && (
              <Button variant="outline" asChild>
                <Link href={`/admin/dang-ky?job=${job.id}`}>Xem ứng tuyển</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/don-hang/${job.slug}`} target="_blank"><ExternalLink /> Xem trang</Link>
            </Button>
          </>
        }
      />
      <JobForm initialData={job} markets={markets} industries={industryRows.map((r) => r.industry)} />
    </>
  );
}
