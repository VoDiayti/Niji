import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { asc } from "drizzle-orm";
import { categories, db, tags } from "@/db";
import { requireUser } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "@/components/admin/posts/post-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Viết bài mới" };

export default async function NewPostPage() {
  const user = await requireUser();
  const [categoryOptions, tagOptions] = await Promise.all([
    db.query.categories.findMany({ columns: { id: true, name: true }, orderBy: [asc(categories.order), asc(categories.name)] }),
    db.query.tags.findMany({ columns: { id: true, name: true }, orderBy: [asc(tags.name)] }),
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
      <PostForm categories={categoryOptions} tags={tagOptions} currentUserName={user.name} />
    </>
  );
}
