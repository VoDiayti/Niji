import Image from "next/image";
import { Breadcrumbs, type Crumb } from "@/components/public/breadcrumbs";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description?: string | null;
  crumbs: Crumb[];
  image?: string | null;
  children?: React.ReactNode;
  className?: string;
  /** Kích thước: compact cho trang danh sách, large cho trang chi tiết có ảnh */
  size?: "compact" | "large";
};

/** Banner đầu trang con: nền xanh đậm (hoặc ảnh), breadcrumb, tiêu đề, mô tả */
export function PageHero({ title, description, crumbs, image, children, className, size = "compact" }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden bg-brand-dark text-white", className)}>
      {image ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 to-brand-dark/40" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-primary to-brand-dark" />
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-32 left-1/4 size-80 rounded-full bg-cta/20 blur-3xl" />
        </>
      )}
      <div className={cn("container-page relative", size === "large" ? "py-12 md:py-20" : "py-10 md:py-14")}>
        <Breadcrumbs items={crumbs} tone="light" className="mb-4" />
        <h1 className={cn("max-w-4xl font-bold leading-tight", size === "large" ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl")}>{title}</h1>
        {description && <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg">{description}</p>}
        {children}
      </div>
    </section>
  );
}
