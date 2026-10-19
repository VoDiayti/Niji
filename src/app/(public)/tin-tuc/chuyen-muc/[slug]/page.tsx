import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/queries/settings";
import { getCategoryBySlug } from "@/lib/queries/posts";
import { paramPage, paramString, type SearchParams } from "@/lib/queries/params";
import { buildMetadata } from "@/lib/seo";
import { NewsListing } from "@/components/public/news-listing";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp, s] = await Promise.all([params, searchParams, getSettings()]);
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Không tìm thấy chuyên mục" };
  return buildMetadata(s, {
    title: category.name,
    description: category.description || `Các bài viết trong chuyên mục ${category.name}.`,
    path: `/tin-tuc/chuyen-muc/${category.slug}`,
    noIndex: Boolean(paramString(sp.q)) || paramPage(sp.page) > 1,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  return (
    <NewsListing
      title={category.name}
      description={category.description}
      crumbs={[{ label: "Tin tức", href: "/tin-tuc" }, { label: category.name }]}
      pathname={`/tin-tuc/chuyen-muc/${category.slug}`}
      q={paramString(sp.q)}
      page={paramPage(sp.page)}
      categorySlug={category.slug}
    />
  );
}
