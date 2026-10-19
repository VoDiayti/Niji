import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/queries/settings";
import { getTagBySlug } from "@/lib/queries/posts";
import { paramPage, paramString, type SearchParams } from "@/lib/queries/params";
import { buildMetadata } from "@/lib/seo";
import { NewsListing } from "@/components/public/news-listing";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, sp, s] = await Promise.all([params, searchParams, getSettings()]);
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Không tìm thấy thẻ" };
  return buildMetadata(s, {
    title: `Thẻ: ${tag.name}`,
    description: `Các bài viết được gắn thẻ ${tag.name}.`,
    path: `/tin-tuc/the/${tag.slug}`,
    noIndex: Boolean(paramString(sp.q)) || paramPage(sp.page) > 1,
  });
}

export default async function TagPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();
  return (
    <NewsListing
      title={`Thẻ: ${tag.name}`}
      description={`Tất cả bài viết liên quan đến “${tag.name}”.`}
      crumbs={[{ label: "Tin tức", href: "/tin-tuc" }, { label: `Thẻ: ${tag.name}` }]}
      pathname={`/tin-tuc/the/${tag.slug}`}
      q={paramString(sp.q)}
      page={paramPage(sp.page)}
      tagSlug={tag.slug}
    />
  );
}
