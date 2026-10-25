import Link from "next/link";
import { ArrowRight, Briefcase, ClipboardList, FileText, Users } from "lucide-react";
import { count, desc, eq, gte } from "drizzle-orm";
import { db, jobOrders, leads, posts } from "@/db";
import { formatDateTime } from "@/lib/format";
import { LEAD_TYPE_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { LeadStatusBadge, PostStatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

/** Mốc thời gian N ngày trước (tách hàm để tuân thủ quy tắc component thuần của React) */
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const sevenDaysAgo = daysAgo(7);

  const [[{ postCount }], [{ publishedCount }], [{ openJobs }], [{ newLeads7d }], [{ totalLeads }], latestLeads, recentPosts] = await Promise.all([
    db.select({ postCount: count() }).from(posts),
    db.select({ publishedCount: count() }).from(posts).where(eq(posts.status, "PUBLISHED")),
    db.select({ openJobs: count() }).from(jobOrders).where(eq(jobOrders.status, "OPEN")),
    db.select({ newLeads7d: count() }).from(leads).where(gte(leads.createdAt, sevenDaysAgo)),
    db.select({ totalLeads: count() }).from(leads),
    db.query.leads.findMany({
      orderBy: [desc(leads.createdAt)],
      limit: 8,
      with: { market: { columns: { name: true } }, jobOrder: { columns: { title: true } } },
    }),
    db.query.posts.findMany({
      orderBy: [desc(posts.updatedAt)],
      limit: 6,
      columns: { id: true, title: true, status: true, updatedAt: true },
      with: { category: { columns: { name: true } } },
    }),
  ]);

  const stats = [
    { label: "Bài viết", value: postCount, sub: `${publishedCount} đã xuất bản`, icon: FileText, href: "/admin/bai-viet" },
    { label: "Đơn hàng đang tuyển", value: openJobs, sub: "Đang hiển thị trên website", icon: Briefcase, href: "/admin/don-hang" },
    { label: "Đăng ký mới (7 ngày)", value: newLeads7d, sub: "Cần liên hệ sớm", icon: ClipboardList, href: "/admin/dang-ky?status=NEW" },
    { label: "Tổng đăng ký", value: totalLeads, sub: "Tư vấn, ứng tuyển, liên hệ", icon: Users, href: "/admin/dang-ky" },
  ];

  return (
    <>
      <PageHeader title="Bảng điều khiển" description="Tổng quan nhanh về nội dung và khách hàng đăng ký." />

      {error === "forbidden" && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>Bạn không có quyền truy cập trang vừa yêu cầu. Chức năng đó chỉ dành cho Quản trị viên.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="size-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
              <Link href={s.href} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Xem chi tiết <ArrowRight className="size-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đăng ký mới nhất</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/dang-ky">Tất cả <ArrowRight /></Link></Button>
          </CardHeader>
          <CardContent>
            {latestLeads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Chưa có đăng ký nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Điện thoại</TableHead>
                    <TableHead className="hidden md:table-cell">Loại</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Quan tâm</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium"><Link href={`/admin/dang-ky/${lead.id}`} className="hover:underline">{lead.fullName}</Link></TableCell>
                      <TableCell><a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a></TableCell>
                      <TableCell className="hidden md:table-cell">{LEAD_TYPE_LABELS[lead.type]}</TableCell>
                      <TableCell className="hidden max-w-48 truncate 2xl:table-cell">{lead.jobOrder?.title ?? lead.market?.name ?? "—"}</TableCell>
                      <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDateTime(lead.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bài viết gần đây</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link href="/admin/bai-viet/moi">Viết bài</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Chưa có bài viết.</p>}
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <Link href={`/admin/bai-viet/${post.id}`} className="line-clamp-2 text-sm font-medium hover:underline">{post.title}</Link>
                  <p className="text-xs text-muted-foreground">{post.category?.name ?? "Chưa phân loại"} · {formatDateTime(post.updatedAt)}</p>
                </div>
                <PostStatusBadge status={post.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
