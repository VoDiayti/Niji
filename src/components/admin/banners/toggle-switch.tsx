"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";
import { Switch } from "@/components/ui/switch";

type ToggleSwitchProps = {
  checked: boolean;
  /** Server action đã bind id, nhận giá trị mới */
  action: (value: boolean) => Promise<ActionResult<unknown>>;
  label: string;
  size?: "sm" | "default";
};

/** Công tắc bật/tắt nhanh ngay trong bảng (hiển thị, nổi bật...) – cập nhật lạc quan, gọi server action rồi refresh */
export function ToggleSwitch({ checked, action, label, size = "sm" }: ToggleSwitchProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(checked);

  return (
    <Switch
      size={size}
      checked={optimistic}
      disabled={pending}
      aria-label={label}
      onCheckedChange={(value) => {
        startTransition(async () => {
          setOptimistic(value);
          const result = await action(value);
          if (result.success) {
            toast.success(result.message ?? "Đã cập nhật");
            router.refresh();
          } else {
            toast.error(result.message);
          }
        });
      }}
    />
  );
}
