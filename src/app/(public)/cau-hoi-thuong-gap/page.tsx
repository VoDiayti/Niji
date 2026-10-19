import type { Metadata } from "next";
import Link from "next/link";
import { CircleQuestionMark, Phone } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getActiveFaqs } from "@/lib/queries/site-content";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { JsonLd } from "@/components/public/json-ld";
import { PublicEmptyState } from "@/components/public/empty-state";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Câu hỏi thường gặp",
    description: "Giải đáp các thắc mắc thường gặp về xuất khẩu lao động: điều kiện, chi phí, thời gian xuất cảnh, mức lương, hỗ trợ sau xuất cảnh.",
    path: "/cau-hoi-thuong-gap",
  });
}

export default async function FaqPage() {
  const [s, faqs] = await Promise.all([getSettings(), getActiveFaqs()]);

  return (
    <>
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <PageHero
        title="Câu hỏi thường gặp"
        description="Những thắc mắc phổ biến của người lao động trước khi quyết định đi làm việc ở nước ngoài."
        crumbs={[{ label: "Hỏi đáp" }]}
      />

      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {faqs.length > 0 ? (
              <Accordion type="single" collapsible className="divide-y rounded-2xl border bg-card px-5 shadow-sm md:px-7">
                {faqs.map((f, i) => (
                  <AccordionItem key={f.id} value={f.id}>
                    <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline md:text-lg [&>svg]:size-5">
                      <span className="flex gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-primary">{i + 1}</span>
                        <span>{f.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-10 text-[15px] leading-relaxed text-muted-foreground">{f.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <PublicEmptyState title="Nội dung đang được cập nhật" />
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-primary/15 bg-brand-light p-6">
              <CircleQuestionMark className="size-10 text-primary" />
              <h2 className="mt-3 text-xl font-bold text-brand-dark">Chưa tìm thấy câu trả lời?</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tư vấn viên sẽ giải đáp trực tiếp mọi thắc mắc của bạn về điều kiện, chi phí và đơn hàng phù hợp.</p>
              <Button asChild size="lg" className="mt-5 h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
                <Link href="/dang-ky-tu-van">Đăng ký tư vấn miễn phí</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="mt-2 h-12 w-full bg-background text-base">
                <a href={telHref(s.hotline)}>
                  <Phone className="size-5" /> {s.hotline}
                </a>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
