"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash } from "lucide-react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmDeleteButtonProps = {
  /** Server action thực hiện xóa */
  action: () => Promise<ActionResult<unknown>>;
  title?: string;
  description?: string;
  /** Chuyển hướng sau khi xóa thành công (nếu không truyền thì chỉ refresh) */
  redirectTo?: string;
  children?: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

/** Nút xóa có hộp thoại xác nhận, gọi server action rồi hiển thị toast */
export function ConfirmDeleteButton({
  action, title = "Xóa mục này?", description = "Hành động này không thể hoàn tác.", redirectTo, children,
  variant = "ghost", size = "icon", className,
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast.success(result.message ?? "Đã xóa thành công");
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={variant} size={size} className={className} aria-label="Xóa">
          {children ?? <Trash className="text-destructive" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pending && <LoaderCircle className="animate-spin" />} Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
