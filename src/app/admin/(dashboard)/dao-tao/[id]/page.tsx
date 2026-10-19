import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PROGRAM_TYPE_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/admin/page-header";
import { ActiveBadge } from "@/components/admin/status-badge";
import { ProgramForm, type ProgramFormInitialData } from "@/components/admin/programs/program-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Chỉnh sửa chương trình đào tạo" };

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = await prisma.trainingProgram.findUnique({ where: { id } });
  if (!program) notFound();

  const initialData: ProgramFormInitialData = {
    id: program.id,
    title: program.title,
    slug: program.slug,
    type: program.type,
    summary: program.summary,
    content: program.content,
    image: program.image,
    duration: program.duration,
    tuition: program.tuition,
    order: program.order,
    isActive: program.isActive,
  };

  return (
    <>
      <PageHeader
        title="Chỉnh sửa chương trình"
        description={program.title}
        actions={
          <>
            <Badge variant="secondary">{PROGRAM_TYPE_LABELS[program.type]}</Badge>
            <ActiveBadge active={program.isActive} />
            <Button variant="outline" asChild>
              <Link href="/admin/dao-tao"><ArrowLeft /> Danh sách chương trình</Link>
            </Button>
          </>
        }
      />
      <ProgramForm initialData={initialData} />
    </>
  );
}
