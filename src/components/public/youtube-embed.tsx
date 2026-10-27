"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Video YouTube kiểu "lite": ban đầu chỉ hiện ảnh bìa + nút phát, bấm mới tải iframe
 * (không tải ~1 MB script của YouTube khi mở trang). Iframe dùng youtube-nocookie.com.
 */
export function YouTubeEmbed({ videoId, title, className }: { videoId: string; title: string; className?: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={cn("relative aspect-video overflow-hidden rounded-3xl bg-black shadow-xl", className)}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Phát video: ${title}`} className="group absolute inset-0 size-full cursor-pointer">
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            fill
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
          <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-8 ring-white/25 transition-transform group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
