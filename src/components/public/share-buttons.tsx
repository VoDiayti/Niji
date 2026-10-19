"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { FacebookIcon, ZaloIcon } from "@/components/public/social-icons";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    ZaloSocialSDK?: { reload?: () => void };
  }
}

/** ID Zalo Official Account – có thì dùng plugin chia sẻ chính thức, không thì dùng link chia sẻ thường */
const ZALO_OA_ID = process.env.NEXT_PUBLIC_ZALO_OA_ID ?? "";

/** Nút chia sẻ bài viết: Facebook, Zalo và sao chép liên kết */
export function ShareButtons({ url, title, className }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const zaloHost = useRef<HTMLDivElement>(null);
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const zaloHref = `https://zalo.me/share?url=${encodeURIComponent(url)}`;

  // SDK Zalo JSON-hóa phần tử nút nên không dùng được phần tử do React render (có thuộc tính fiber vòng tròn).
  // Tạo nút bằng DOM thuần trong effect rồi gọi reload() để SDK quét lại.
  useEffect(() => {
    const host = zaloHost.current;
    if (!host || !ZALO_OA_ID) return;
    host.replaceChildren();
    const button = document.createElement("div");
    button.className = "zalo-share-button";
    button.dataset.href = url;
    button.dataset.oaid = ZALO_OA_ID;
    button.dataset.layout = "2";
    button.dataset.color = "blue";
    button.dataset.customize = "false";
    host.appendChild(button);
    try {
      window.ZaloSocialSDK?.reload?.();
    } catch {
      // SDK bên thứ ba – bỏ qua lỗi để không ảnh hưởng trang
    }
    return () => host.replaceChildren();
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã sao chép liên kết");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không sao chép được, vui lòng copy thủ công");
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="mr-1 text-sm font-medium text-muted-foreground">Chia sẻ:</span>
      <a
        href={fbHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chia sẻ "${title}" lên Facebook`}
        className="inline-flex h-9 items-center gap-2 rounded-full bg-[#1877f2] px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <FacebookIcon className="size-4" /> Facebook
      </a>

      {ZALO_OA_ID ? (
        <>
          {/* Plugin chia sẻ Zalo chính thức – nút được tạo trong effect */}
          <div ref={zaloHost} className="inline-flex min-h-9 items-center" aria-label="Chia sẻ lên Zalo" />
          <Script
            src="https://sp.zalo.me/plugins/sdk.js"
            strategy="lazyOnload"
            onLoad={() => {
              try {
                window.ZaloSocialSDK?.reload?.();
              } catch {
                // bỏ qua lỗi của SDK
              }
            }}
          />
        </>
      ) : (
        <a
          href={zaloHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chia sẻ "${title}" lên Zalo`}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-[#0068ff] px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <ZaloIcon className="size-4" /> Zalo
        </a>
      )}

      <button
        type="button"
        onClick={copy}
        className="inline-flex h-9 items-center gap-2 rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:bg-muted"
      >
        {copied ? <Check className="size-4 text-emerald-600" /> : <LinkIcon className="size-4" />}
        {copied ? "Đã sao chép" : "Sao chép liên kết"}
      </button>
    </div>
  );
}
