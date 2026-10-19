"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = React.ComponentProps<typeof Button> & { pending?: boolean; pendingText?: string };

/** Nút submit hiển thị trạng thái đang xử lý (dùng với form action hoặc truyền `pending` thủ công) */
export function SubmitButton({ children, pending, pendingText, disabled, ...props }: SubmitButtonProps) {
  const status = useFormStatus();
  const isPending = pending ?? status.pending;
  return (
    <Button type="submit" disabled={disabled || isPending} {...props}>
      {isPending && <LoaderCircle className="animate-spin" />}
      {isPending && pendingText ? pendingText : children}
    </Button>
  );
}
