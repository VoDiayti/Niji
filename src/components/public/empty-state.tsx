import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/** Khối thông báo khi danh sách trống (trang công khai) */
export function PublicEmptyState({
  title = "Chưa có dữ liệu",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-background px-6 py-14 text-center", className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-light text-primary">
        <Inbox className="size-7" />
      </span>
      <p className="text-lg font-semibold">{title}</p>
      {description && <p className="max-w-md text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
