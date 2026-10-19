import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowRight, House, Phone, Search } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { FloatingContact } from "@/components/public/floating-contact";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: false },
};

/** Trang 404 – dùng chung cho URL không tồn tại và notFound() từ các trang công khai */
export default async function NotFound() {
  // Render động khi có request (không prerender lúc build) để đọc được cài đặt từ D1 qua binding Cloudflare
  await connection();
  const s = await getSettings();
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center bg-muted py-16 md:py-24">
        <div className="container-page text-center">
          <p className="text-7xl font-black text-primary/15 md:text-9xl">404</p>
          <h1 className="-mt-4 text-2xl font-bold text-brand-dark md:text-4xl">Không tìm thấy trang bạn yêu cầu</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground md:text-lg">
            Trang có thể đã bị xóa, đổi địa chỉ hoặc tạm thời không hiển thị (bài viết chưa đến giờ đăng, đơn hàng đã đóng).
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6 text-base">
              <Link href="/">
                <House className="size-5" /> Về trang chủ
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 bg-background px-6 text-base">
              <Link href="/don-hang">
                <Search className="size-5" /> Xem đơn hàng đang tuyển
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 bg-background px-6 text-base">
              <a href={telHref(s.hotline)}>
                <Phone className="size-5" /> {s.hotline}
              </a>
            </Button>
          </div>
          <Link href="/tin-tuc" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Hoặc đọc tin tức mới nhất <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
      <FloatingContact hotline={s.hotline} zalo={s.zalo} messenger={s.messenger} />
    </>
  );
}
