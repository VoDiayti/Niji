import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Ô thông tin ngắn (nhãn + giá trị) dùng ở trang chi tiết thị trường / đơn hàng */
export function InfoItem({
  icon: Icon,
  label,
  value,
  highlight,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  if (value == null || value === "") return null;
  return (
    <div className={cn("flex gap-3 rounded-2xl border bg-card p-4", highlight && "border-cta/30 bg-orange-50", className)}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", highlight ? "bg-cta text-cta-foreground" : "bg-brand-light text-primary")}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("mt-0.5 text-sm font-semibold leading-snug md:text-[15px]", highlight && "text-primary")}>{value}</p>
      </div>
    </div>
  );
}
