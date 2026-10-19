import type { Metadata } from "next";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteTestimonial, toggleTestimonialActive } from "@/actions/testimonials";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { TestimonialFormDialog } from "@/components/admin/testimonials/testimonial-form";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Cảm nhận học viên" };
export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const items = await prisma.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });

  return (
    <>
      <PageHeader
        title="Cảm nhận học viên"
        description="Chia sẻ của học viên, lao động đã xuất cảnh – hiển thị ở trang chủ để tăng độ tin cậy."
        actions={<TestimonialFormDialog />}
      />

      {items.length === 0 ? (
        <EmptyState title="Chưa có cảm nhận" description="Thêm cảm nhận đầu tiên của học viên." action={<TestimonialFormDialog />} />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ảnh</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead className="hidden lg:table-cell">Nội dung</TableHead>
                <TableHead className="hidden w-28 md:table-cell">Đánh giá</TableHead>
                <TableHead className="w-20 text-center">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell><Thumbnail src={item.avatar} className="size-12 rounded-full" /></TableCell>
                  <TableCell className="max-w-56 whitespace-normal">
                    <p className="font-medium">{item.name}</p>
                    {item.position && <p className="text-xs text-muted-foreground">{item.position}</p>}
                  </TableCell>
                  <TableCell className="hidden max-w-md whitespace-normal text-muted-foreground lg:table-cell">
                    <p className="line-clamp-2">{item.content}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${item.rating} sao`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={i < item.rating ? "size-3.5 fill-current" : "size-3.5 text-muted-foreground/40"} />
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{item.order}</TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={item.isActive} action={toggleTestimonialActive.bind(null, item.id)} label="Hiển thị cảm nhận" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <TestimonialFormDialog testimonial={item} />
                      <ConfirmDeleteButton action={deleteTestimonial.bind(null, item.id)} title="Xóa cảm nhận này?" description={`Cảm nhận của "${item.name}" sẽ bị xóa.`} />
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
