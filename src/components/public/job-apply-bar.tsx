import { Phone, Send } from "lucide-react";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";

/** Thanh hành động cố định dưới màn hình điện thoại ở trang chi tiết đơn hàng */
export function JobApplyBar({ hotline }: { hotline: string }) {
  return (
    <div
      data-mobile-bar
      className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t bg-background/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Button asChild variant="outline" size="lg" className="h-12 shrink-0 border-primary/30 px-4 text-primary" aria-label={`Gọi ${hotline}`}>
        <a href={telHref(hotline)}>
          <Phone className="size-5" />
        </a>
      </Button>
      <Button asChild size="lg" className="h-12 flex-1 bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
        <a href="#ung-tuyen">
          <Send className="size-5" /> Ứng tuyển ngay
        </a>
      </Button>
    </div>
  );
}
