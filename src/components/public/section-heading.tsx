import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Nhãn nhỏ màu cam phía trên tiêu đề */
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /** Màu chữ khi đặt trên nền tối */
  tone?: "default" | "light";
  className?: string;
  as?: "h1" | "h2";
};

/** Tiêu đề section: nhãn nhỏ + tiêu đề lớn + mô tả */
export function SectionHeading({ label, title, description, align = "center", tone = "default", className, as = "h2" }: SectionHeadingProps) {
  const Tag = as;
  return (
    <div className={cn("mb-10 max-w-3xl md:mb-12", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {label && (
        <p className={cn("mb-2 text-sm font-semibold uppercase tracking-wider", tone === "light" ? "text-amber-300" : "text-primary")}>{label}</p>
      )}
      <Tag className={cn("text-2xl font-bold leading-tight md:text-4xl", tone === "light" ? "text-white" : "text-brand-dark")}>{title}</Tag>
      {description && (
        <p className={cn("mt-3 text-base leading-relaxed md:text-lg", tone === "light" ? "text-white/80" : "text-muted-foreground")}>{description}</p>
      )}
    </div>
  );
}
