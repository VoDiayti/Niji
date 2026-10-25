import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { asc, count, eq } from "drizzle-orm";
import { db, jobOrders, jobPrograms, leads, markets } from "@/db";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { JobForm } from "@/components/admin/jobs/job-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Sửa đơn hàng" };
export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, [{ leadCount }], marketOptions, industryRows, programOptions] = await Promise.all([
    db.query.jobOrders.findFirst({ where: eq(jobOrders.id, id) }),
    db.select({ leadCount: count() }).from(leads).where(eq(leads.jobOrderId, id)),
    db.select({ id: markets.id, name: markets.name }).from(markets).orderBy(asc(markets.order), asc(markets.name)),
    db.selectDistinct({ industry: jobOrders.industry }).from(jobOrders).orderBy(asc(jobOrders.industry)),
    // Kể cả chương trình đang ẩn (form đánh dấu "(ẩn)")
    db.query.jobPrograms.findMany({ orderBy: [asc(jobPrograms.order), asc(jobPrograms.name)], columns: { id: true, name: true, isActive: true } }),
  ]);
  if (!job) notFound();

  return (
    <>
      <PageHeader
        title={job.title}
        description={`${leadCount} lượt ứng tuyển · ${job.viewCount} lượt xem · Cập nhật ${formatDateTime(job.updatedAt)}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/don-hang"><ArrowLeft /> Quay lại</Link>
            </Button>
            {leadCount > 0 && (
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
      <JobForm initialData={job} markets={marketOptions} industries={industryRows.map((r) => r.industry)} programs={programOptions} />
    </>
  );
}
