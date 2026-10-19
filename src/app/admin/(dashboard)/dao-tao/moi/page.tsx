import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ProgramForm } from "@/components/admin/programs/program-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thêm chương trình đào tạo" };

export default function NewProgramPage() {
  return (
    <>
      <PageHeader
        title="Thêm chương trình"
        description="Chương trình du học nghề, khóa đào tạo tiếng hoặc kỹ năng nghề."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/dao-tao"><ArrowLeft /> Danh sách chương trình</Link>
          </Button>
        }
      />
      <ProgramForm />
    </>
  );
}
