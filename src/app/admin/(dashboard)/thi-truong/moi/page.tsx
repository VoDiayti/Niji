import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { MarketForm } from "@/components/admin/markets/market-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm thị trường" };

export default function NewMarketPage() {
  return (
    <>
      <PageHeader
        title="Thêm thị trường"
        description="Tạo thị trường xuất khẩu lao động mới (quốc gia / chương trình)."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/thi-truong"><ArrowLeft /> Quay lại</Link>
          </Button>
        }
      />
      <MarketForm />
    </>
  );
}
