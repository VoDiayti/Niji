import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { asc } from "drizzle-orm";
import { db, partners } from "@/db";
import { deletePartner, togglePartnerActive } from "@/actions/partners";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ToggleSwitch } from "@/components/admin/banners/toggle-switch";
import { Thumbnail } from "@/components/admin/banners/thumbnail";
import { PartnerFormDialog } from "@/components/admin/partners/partner-form";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Đối tác" };
export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const items = await db.query.partners.findMany({ orderBy: [asc(partners.order), asc(partners.name)] });

  return (
    <>
      <PageHeader
        title="Đối tác"
        description="Logo nghiệp đoàn, doanh nghiệp tiếp nhận và đối tác liên kết hiển thị trên trang chủ."
        actions={<PartnerFormDialog />}
      />

      {items.length === 0 ? (
        <EmptyState title="Chưa có đối tác" description="Thêm logo đối tác để tăng uy tín cho website." action={<PartnerFormDialog />} />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Logo</TableHead>
                <TableHead>Tên đối tác</TableHead>
                <TableHead className="hidden md:table-cell">Website</TableHead>
                <TableHead className="w-20 text-center">Thứ tự</TableHead>
                <TableHead className="w-24 text-center">Hiển thị</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell><Thumbnail src={partner.logo} fit="contain" className="w-24 bg-white" /></TableCell>
                  <TableCell className="max-w-64 whitespace-normal font-medium">{partner.name}</TableCell>
                  <TableCell className="hidden max-w-72 truncate md:table-cell">
                    {partner.website ? (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        {partner.website.replace(/^https?:\/\//, "")} <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{partner.order}</TableCell>
                  <TableCell className="text-center">
                    <ToggleSwitch checked={partner.isActive} action={togglePartnerActive.bind(null, partner.id)} label="Hiển thị đối tác" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <PartnerFormDialog partner={partner} />
                      <ConfirmDeleteButton action={deletePartner.bind(null, partner.id)} title="Xóa đối tác này?" description={`Đối tác "${partner.name}" sẽ bị xóa khỏi website.`} />
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
