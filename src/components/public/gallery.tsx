import Image from "next/image";
import { cn } from "@/lib/utils";

export type GalleryImage = { src: string; alt: string; caption?: string };

/** Lưới ảnh hoạt động (ảnh đầu tiên lớn hơn) */
export function Gallery({ images, className }: { images: GalleryImage[]; className?: string }) {
  if (images.length === 0) return null;
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4", className)}>
      {images.map((img, i) => (
        <figure
          key={img.src}
          className={cn("group relative overflow-hidden rounded-2xl bg-muted", i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square")}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {img.caption && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-xs font-medium text-white md:text-sm">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
