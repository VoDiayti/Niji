import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Mail, MessageCircle, Phone, Trash } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LEAD_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime, telHref, timeAgo, zaloHref } from "@/lib/format";
import { deleteLead } from "@/actions/leads";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { LeadStatusSelect } from "@/components/admin/leads/lead-status-select";
import { LeadNoteForm } from "@/components/admin/leads/lead-note-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Chi tiết đăng ký" };
export const dynamic = "force-dynamic";

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

const Empty = () => <span className="text-muted-foreground">—</span>;

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      market: { select: { id: true, name: true, slug: true } },
      jobOrder: { select: { id: true, title: true, slug: true, market: { select: { name: true } } } },
    },
  });
  if (!lead) notFound();

  return (
    <>
      <PageHeader
        title={lead.fullName}
        description={`${LEAD_TYPE_LABELS[lead.type]} · gửi ${timeAgo(lead.createdAt)} (${formatDateTime(lead.createdAt)})`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/dang-ky"><ArrowLeft /> Danh sách</Link>
            </Button>
            <ConfirmDeleteButton
              action={deleteLead.bind(null, lead.id)}
              redirectTo="/admin/dang-ky"
              variant="outline"
              size="default"
              className="text-destructive hover:text-destructive"
              title="Xóa đăng ký này?"
              description={`Thông tin đăng ký của "${lead.fullName}" sẽ bị xóa vĩnh viễn.`}
            >
              <Trash /> Xóa
            </ConfirmDeleteButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin đăng ký</CardTitle>
            <CardDescription>Dữ liệu khách hàng điền trên website.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y">
              <InfoRow label="Họ và tên"><span className="font-medium">{lead.fullName}</span></InfoRow>
              <InfoRow label="Số điện thoại">
                <div className="flex flex-wrap items-center gap-2">
                  <a href={telHref(lead.phone)} className="font-medium text-primary hover:underline">{lead.phone}</a>
                  <Button variant="outline" size="xs" asChild><a href={telHref(lead.phone)}><Phone /> Gọi</a></Button>
                  <Button variant="outline" size="xs" asChild>
                    <a href={zaloHref(lead.phone)} target="_blank" rel="noopener noreferrer"><MessageCircle /> Zalo</a>
                  </Button>
                </div>
              </InfoRow>
              <InfoRow label="Email">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail className="size-3.5" /> {lead.email}</a>
                ) : <Empty />}
              </InfoRow>
              <InfoRow label="Năm sinh">{lead.birthYear ? `${lead.birthYear} (${new Date().getFullYear() - lead.birthYear} tuổi)` : <Empty />}</InfoRow>
              <InfoRow label="Quê quán">{lead.hometown || <Empty />}</InfoRow>
              <InfoRow label="Loại đăng ký"><Badge variant="secondary">{LEAD_TYPE_LABELS[lead.type]}</Badge></InfoRow>
              <InfoRow label="Thị trường quan tâm">
                {lead.market ? (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <Link href={`/admin/thi-truong/${lead.market.id}`} className="font-medium hover:underline">{lead.market.name}</Link>
                    <Link href={`/thi-truong/${lead.market.slug}`} target="_blank" className="text-muted-foreground hover:text-foreground" aria-label="Xem trang công khai"><ExternalLink className="size-3.5" /></Link>
                  </span>
                ) : <Empty />}
              </InfoRow>
              <InfoRow label="Đơn hàng ứng tuyển">
                {lead.jobOrder ? (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <Link href={`/admin/don-hang/${lead.jobOrder.id}`} className="font-medium hover:underline">{lead.jobOrder.title}</Link>
                    <span className="text-xs text-muted-foreground">({lead.jobOrder.market.name})</span>
                    <Link href={`/don-hang/${lead.jobOrder.slug}`} target="_blank" className="text-muted-foreground hover:text-foreground" aria-label="Xem trang công khai"><ExternalLink className="size-3.5" /></Link>
                  </span>
                ) : <Empty />}
              </InfoRow>
              <InfoRow label="Ghi chú của khách">
                {lead.message ? <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3">{lead.message}</p> : <Empty />}
              </InfoRow>
              <InfoRow label="Nguồn (trang gửi form)">{lead.source ? <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{lead.source}</code> : <Empty />}</InfoRow>
              <InfoRow label="Địa chỉ IP">{lead.ipAddress ? <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{lead.ipAddress}</code> : <Empty />}</InfoRow>
              <InfoRow label="Thời gian gửi">{formatDateTime(lead.createdAt)}</InfoRow>
              <InfoRow label="Cập nhật lần cuối">{formatDateTime(lead.updatedAt)}</InfoRow>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái xử lý</CardTitle>
              <CardDescription>Thay đổi được lưu ngay lập tức.</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadStatusSelect id={lead.id} status={lead.status} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ghi chú nội bộ</CardTitle>
              <CardDescription>Lịch sử trao đổi, kết quả gọi điện, lưu ý cho đồng nghiệp.</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadNoteForm id={lead.id} note={lead.adminNote} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
