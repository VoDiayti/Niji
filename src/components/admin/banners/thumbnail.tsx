import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Ảnh thu nhỏ trong bảng admin (URL bất kỳ, không qua next/image) */
export function Thumbnail({ src, alt = "", className, fit = "cover" }: { src?: string | null; alt?: string; className?: string; fit?: "cover" | "contain" }) {
  return (
    <div className={cn("flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL ảnh bất kỳ trong admin, không qua next/image
        <img src={src} alt={alt} className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain p-1")} loading="lazy" />
      ) : (
        <ImageIcon className="size-5 text-muted-foreground/60" />
      )}
    </div>
  );
}
