"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { LeadStatus } from "@/generated/prisma/enums";
import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { LEAD_STATUSES } from "@/lib/validations/lead-admin";
import { updateLeadStatus } from "@/actions/leads";
import { LeadStatusBadge } from "@/components/admin/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Select đổi trạng thái xử lý – lưu ngay khi chọn */
export function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(status);

  return (
    <Select
      value={optimistic}
      disabled={pending}
      onValueChange={(value) =>
        startTransition(async () => {
          setOptimistic(value as LeadStatus);
          const result = await updateLeadStatus(id, value);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        })
      }
    >
      <SelectTrigger className="w-full" aria-label="Trạng thái xử lý">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <LeadStatusBadge status={s} /> <span className="sr-only">{LEAD_STATUS_LABELS[s]}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
