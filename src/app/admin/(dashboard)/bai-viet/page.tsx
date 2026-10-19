import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Image as ImageIcon, Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { ADMIN_PAGE_SIZE, POST_STATUS_LABELS } from "@/lib/constants";
import { NONE_VALUE } from "@/lib/validations/post";
import { deletePost } from "@/actions/posts";
import type { Prisma } from "@/generated/prisma/client";
import type { PostStatus } from "@/generated/prisma/enums";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput, UrlParamSelect } from "@/components/admin/url-filters";
import { ListPagination } from "@/components/admin/list-pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { PostStatusBadge } from "@/components/admin/status-badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { PostFeaturedToggle } from "@/components/admin/posts/post-featured-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata: Metadata = { title: "Bài viết" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string; status?: string; page?: string }>;

function isPostStatus(value: string | undefined): value is PostStatus {
  return !!value && value in POST_STATUS_LABELS;
}

export default async function PostsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const status = isPostStatus(sp.status) ? sp.status : undefined;
  const category = sp.category?.trim() || undefined;

  const where: Prisma.PostWhereInput = {
    ...(q ? { title: { contains: q } } : {}),
    ...(status ? { status } : {}),
    ...(category === NONE_VALUE ? { categoryId: null } : category ? { categoryId: category } : {}),
  };

  const [posts, total, categories] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true, title: true, slug: true, coverImage: true, status: true, isFeatured: true, publishedAt: true, updatedAt: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const hasFilters = Boolean(q || status || category);

  return (
    <>
      <PageHeader
        title="Bài viết"
        description={`${total} bài viết${hasFilters ? " phù hợp bộ lọc" : ""}`}
        actions={
          <Button asChild>
            <Link href="/admin/bai-viet/moi"><Plus /> Viết bài mới</Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Tìm theo tiêu đề..." className="w-full sm:w-72" />
        <UrlParamSelect
          param="category"
          allLabel="Tất cả chuyên mục"
          placeholder="Chuyên mục"
          options={[{ value: NONE_VALUE, label: "Chưa phân loại" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          className="w-full sm:w-52"
        />
        <UrlParamSelect
          param="status"
          allLabel="Tất cả trạng thái"
          placeholder="Trạng thái"
          options={Object.entries(POST_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          className="w-full sm:w-44"
        />
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title={hasFilters ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết nào"}
          description={hasFilters ? "Thử đổi từ khóa hoặc bỏ bộ lọc." : "Bắt đầu bằng cách viết bài đầu tiên cho mục Tin tức."}
          action={!hasFilters && <Button asChild><Link href="/admin/bai-viet/moi"><Plus /> Viết bài mới</Link></Button>}
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Ảnh</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead className="hidden md:table-cell">Chuyên mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Nổi bật</TableHead>
                <TableHead className="hidden lg:table-cell">Tác giả</TableHead>
                <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL ảnh bất kỳ trong admin
                      <img src={post.coverImage} alt="" className="h-10 w-16 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-muted-foreground">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal md:max-w-md">
                    <Link href={`/admin/bai-viet/${post.id}`} className="line-clamp-2 font-medium hover:underline">{post.title}</Link>
                    <p className="truncate text-xs text-muted-foreground">/tin-tuc/{post.slug}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {post.category?.name ?? <span className="text-muted-foreground">Chưa phân loại</span>}
                  </TableCell>
                  <TableCell><PostStatusBadge status={post.status} /></TableCell>
                  <TableCell className="text-center">
                    <PostFeaturedToggle id={post.id} isFeatured={post.isFeatured} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{post.author?.name ?? "—"}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                    <div>{post.publishedAt ? `Xuất bản: ${formatDateTime(post.publishedAt)}` : "Chưa xuất bản"}</div>
                    <div>Cập nhật: {formatDateTime(post.updatedAt)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-0.5">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/bai-viet/${post.id}`} aria-label="Sửa" title="Sửa"><Pencil /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/bai-viet/${post.id}/xem-truoc`} target="_blank" aria-label="Xem trước" title="Xem trước (mở tab mới)"><Eye /></Link>
                      </Button>
                      <ConfirmDeleteButton
                        action={deletePost.bind(null, post.id)}
                        title="Xóa bài viết?"
                        description={`Bài viết "${post.title}" sẽ bị xóa vĩnh viễn khỏi website. Hành động này không thể hoàn tác.`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ListPagination page={page} totalPages={totalPages} className="mt-6" />
    </>
  );
}
