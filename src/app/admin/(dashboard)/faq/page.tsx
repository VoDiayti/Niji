import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { deleteFaq, toggleFaqActive } from "@/actions/faqs";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { FaqFormDialog } from "@/components/admin/faqs/faq-form";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Câu hỏi thường gặp" };
export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });

  return (
    <>
      <PageHeader
        title="Câu hỏi thường gặp"
        description="Hiển thị ở trang Hỏi đáp và trang chủ. Trả lời rõ ràng giúp giảm số cuộc gọi tư vấn lặp lại."
        actions={<FaqFormDialog />}
      />

      {faqs.length === 0 ? (
        <EmptyState title="Chưa có câu hỏi" description="Thêm những câu hỏi khách hàng hay thắc mắc nhất." action={<FaqFormDialog />} />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Câu hỏi</TableHead>
                <TableHead className="hidden lg:table-cell">Câu trả lời</TableHead>
                <TableHead className="w-20 text-center">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="max-w-sm whitespace-normal font-medium"><p className="line-clamp-2">{faq.question}</p></TableCell>
                  <TableCell className="hidden max-w-lg whitespace-normal text-muted-foreground lg:table-cell"><p className="line-clamp-2">{faq.answer}</p></TableCell>
                  <TableCell className="text-center">{faq.order}</TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={faq.isActive} action={toggleFaqActive.bind(null, faq.id)} label="Hiển thị câu hỏi" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <FaqFormDialog faq={faq} />
                      <ConfirmDeleteButton action={deleteFaq.bind(null, faq.id)} title="Xóa câu hỏi này?" description="Câu hỏi và câu trả lời sẽ bị xóa khỏi website." />
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
