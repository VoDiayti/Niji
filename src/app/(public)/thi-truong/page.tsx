import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { getActiveMarkets } from "@/lib/queries/markets";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/public/page-hero";
import { MarketCard } from "@/components/public/market-card";
import { PublicEmptyState } from "@/components/public/empty-state";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Thị trường xuất khẩu lao động",
    description: "Tổng hợp các thị trường xuất khẩu lao động: Nhật Bản, Hàn Quốc, Đài Loan, Đức, châu Âu, Úc – điều kiện, chi phí, mức lương và ngành nghề phổ biến.",
    path: "/thi-truong",
  });
}

export default async function MarketsPage() {
  const [s, markets] = await Promise.all([getSettings(), getActiveMarkets()]);
  return (
    <>
      <PageHero
        title="Thị trường xuất khẩu lao động"
        description="So sánh mức lương, chi phí, thời gian hợp đồng và ngành nghề của từng thị trường để chọn hướng đi phù hợp nhất với bạn."
        crumbs={[{ label: "Thị trường" }]}
      />
      <section className="bg-muted py-14 md:py-20">
        <div className="container-page">
          {markets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {markets.map((m, i) => (
                <MarketCard key={m.id} market={m} priority={i < 3} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Thông tin thị trường đang được cập nhật" />
          )}
        </div>
      </section>
      <CtaSection hotline={s.hotline} title="Chưa biết chọn thị trường nào?" description="Tư vấn viên sẽ phân tích điều kiện của bạn và gợi ý thị trường, đơn hàng phù hợp nhất – hoàn toàn miễn phí." />
    </>
  );
}
