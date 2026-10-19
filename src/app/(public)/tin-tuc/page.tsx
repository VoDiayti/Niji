import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { paramPage, paramString, type SearchParams } from "@/lib/queries/params";
import { buildMetadata } from "@/lib/seo";
import { NewsListing } from "@/components/public/news-listing";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const q = paramString(sp.q);
  return buildMetadata(s, {
    title: q ? `Tìm kiếm: ${q}` : "Tin tức xuất khẩu lao động",
    description: "Tin tức thị trường, kinh nghiệm thi tuyển, chính sách – pháp luật và hoạt động của công ty dành cho người lao động đi làm việc ở nước ngoài.",
    path: "/tin-tuc",
    noIndex: Boolean(q) || paramPage(sp.page) > 1,
  });
}

export default async function NewsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = paramString(sp.q);
  return (
    <NewsListing
      title="Tin tức & Kinh nghiệm"
      description="Cập nhật thông tin thị trường, kinh nghiệm thi tuyển, chính sách mới và hoạt động của công ty."
      crumbs={[{ label: "Tin tức" }]}
      pathname="/tin-tuc"
      q={q}
      page={paramPage(sp.page)}
    />
  );
}
