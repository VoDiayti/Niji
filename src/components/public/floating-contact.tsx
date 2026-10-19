import { Phone } from "lucide-react";
import { telHref, zaloHref } from "@/lib/format";
import { MessengerIcon, ZaloIcon } from "@/components/public/social-icons";

type FloatingContactProps = {
  hotline: string;
  zalo?: string | null;
  messenger?: string | null;
};

/**
 * Cụm nút liên hệ nổi ở góc phải dưới: Gọi điện, Zalo, Messenger.
 * Khi trang có thanh hành động cố định trên di động ([data-mobile-bar]) sẽ tự nâng lên để không bị che.
 */
export function FloatingContact({ hotline, zalo, messenger }: FloatingContactProps) {
  const base =
    "flex size-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 active:scale-95 md:size-12";
  return (
    <div
      className="fixed bottom-4 right-3 z-30 flex flex-col items-center gap-3 md:bottom-6 md:right-5 max-md:[body:has([data-mobile-bar])_&]:bottom-[5.25rem]"
      aria-label="Liên hệ nhanh"
    >
      {messenger && (
        <a href={messenger} target="_blank" rel="noopener noreferrer" className={`${base} bg-[#0084ff]`} title="Nhắn tin Messenger">
          <MessengerIcon className="size-7 md:size-6" />
          <span className="sr-only">Nhắn tin Messenger</span>
        </a>
      )}
      {zalo && (
        <a href={zaloHref(zalo)} target="_blank" rel="noopener noreferrer" className={`${base} bg-[#0068ff]`} title="Chat Zalo">
          <ZaloIcon className="size-8 text-white md:size-7" />
          <span className="sr-only">Chat Zalo</span>
        </a>
      )}
      <a href={telHref(hotline)} className={`${base} relative bg-cta hover:bg-cta-hover`} title={`Gọi ${hotline}`}>
        <span className="absolute inset-0 animate-ping rounded-full bg-cta/50 [animation-duration:2s]" aria-hidden="true" />
        <Phone className="relative size-6 md:size-5" />
        <span className="sr-only">Gọi hotline {hotline}</span>
      </a>
    </div>
  );
}
