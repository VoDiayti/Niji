import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { PageHeader } from "@/components/admin/page-header";
import { SearchInput } from "@/components/admin/url-filters";
import { ListPagination } from "@/components/admin/list-pagination";
import { MediaLibrary } from "@/components/admin/media/media-library";
import { MediaUploadButton } from "@/components/admin/media/media-upload-button";
import { MEDIA_PAGE_SIZE, toMediaItem } from "@/components/admin/media/media-types";

export const metadata: Metadata = { title: "Thư viện ảnh" };
export const dynamic = "force-dynamic";

export default async function MediaLibraryPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.MediaWhereInput = q
    ? { OR: [{ filename: { contains: q } }, { alt: { contains: q } }] }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * MEDIA_PAGE_SIZE,
      take: MEDIA_PAGE_SIZE,
      include: { uploadedBy: { select: { name: true } } },
    }),
    prisma.media.count({ where }),
  ]);
  const items = rows.map(toMediaItem);
  const totalPages = Math.ceil(total / MEDIA_PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Thư viện ảnh"
        description={`${total} ảnh${q ? " phù hợp từ khóa" : ""} – dùng lại cho bài viết, banner, thị trường, đơn hàng.`}
        actions={<MediaUploadButton />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchInput placeholder="Tìm theo tên file hoặc mô tả..." className="w-full sm:w-80" />
      </div>

      <MediaLibrary items={items} />

      <ListPagination page={page} totalPages={totalPages} className="mt-6" />
    </>
  );
}
