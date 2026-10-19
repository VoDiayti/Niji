import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/posts/post-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Viết bài mới" };

export default async function NewPostPage() {
  const user = await requireUser();
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader
        title="Viết bài mới"
        description="Soạn nội dung, chọn chuyên mục và trạng thái rồi bấm Lưu."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/bai-viet"><ArrowLeft /> Danh sách bài viết</Link>
          </Button>
        }
      />
      <PostForm categories={categories} tags={tags} currentUserName={user.name} />
    </>
  );
}
