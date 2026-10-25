"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleX, LoaderCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { JobStatus } from "@/db/enums";
import { toggleJobStatus } from "@/actions/jobs";
import { JobStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Badge trạng thái + nút đổi nhanh Đang tuyển ⇄ Đã đóng */
export function JobStatusToggle({ id, status }: { id: string; status: JobStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const label = status === "OPEN" ? "Đóng đơn hàng" : "Mở lại đơn hàng";

  return (
    <div className="inline-flex items-center gap-1">
      <JobStatusBadge status={status} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await toggleJobStatus(id);
                if (result.success) {
                  toast.success(result.message);
                  router.refresh();
                } else {
                  toast.error(result.message);
                }
              })
            }
          >
            {pending ? <LoaderCircle className="animate-spin" /> : status === "OPEN" ? <CircleX className="text-muted-foreground" /> : <RotateCcw className="text-emerald-600" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </div>
  );
}
