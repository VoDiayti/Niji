import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deleteBanner, toggleBannerActive } from "@/actions/banners";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { BannerFormDialog } from "@/components/admin/banners/banner-form";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Banner" };
export const dynamic = "force-dynamic";

export default async function BannerPage() {
  const banners = await prisma.banner.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });

  return (
    <>
      <PageHeader
        title="Banner trang chủ"
        description="Ảnh lớn trượt ở đầu trang chủ. Chỉ các banner đang hiển thị mới xuất hiện trên website."
        actions={<BannerFormDialog />}
      />

      {banners.length === 0 ? (
        <EmptyState title="Chưa có banner" description="Thêm banner đầu tiên để trang chủ có ảnh giới thiệu nổi bật." action={<BannerFormDialog />} />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="hidden md:table-cell">Phụ đề</TableHead>
                <TableHead className="w-20 text-center">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell><Thumbnail src={banner.image} className="w-20" /></TableCell>
                  <TableCell className="max-w-64 whitespace-normal font-medium">
                    <p className="line-clamp-2">{banner.title}</p>
                    {(banner.ctaText || banner.ctaText2) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">Nút: {[banner.ctaText, banner.ctaText2].filter(Boolean).join(" · ")}</p>
                    )}
                  </TableCell>
                  <TableCell className="hidden max-w-72 whitespace-normal text-muted-foreground md:table-cell">
                    <p className="line-clamp-2">{banner.subtitle || "—"}</p>
                  </TableCell>
                  <TableCell className="text-center">{banner.order}</TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={banner.isActive} action={toggleBannerActive.bind(null, banner.id)} label="Hiển thị banner" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <BannerFormDialog banner={banner} />
                      <ConfirmDeleteButton action={deleteBanner.bind(null, banner.id)} title="Xóa banner này?" description={`Banner "${banner.title}" sẽ bị xóa khỏi trang chủ.`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
