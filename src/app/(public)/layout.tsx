import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { FloatingContact } from "@/components/public/floating-contact";
import { JsonLd } from "@/components/public/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const siteName = s.shortName || s.companyName;
  const base = buildMetadata(s, {
    title: s.metaTitle || `${siteName} – Xuất khẩu lao động uy tín`,
    absoluteTitle: true,
    description: s.metaDescription,
    path: "/",
  });
  return {
    ...base,
    title: {
      default: s.metaTitle || `${siteName} – Xuất khẩu lao động uy tín`,
      template: `%s | ${siteName}`,
    },
    applicationName: siteName,
    keywords: ["xuất khẩu lao động", "đơn hàng Nhật Bản", "EPS Hàn Quốc", "Đài Loan", "du học nghề Đức", siteName],
    robots: { index: true, follow: true },
  };
}

/** Layout nhóm trang công khai: Header, Footer, nút liên hệ nổi, JSON-LD Organization */
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <JsonLd data={[organizationJsonLd(s), websiteJsonLd(s)]} />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <FloatingContact hotline={s.hotline} zalo={s.zalo} messenger={s.messenger} />
    </>
  );
}
