"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type FormDialogProps = {
  title: string;
  description?: string;
  /** Nút mở hộp thoại */
  trigger: React.ReactNode;
  /** Render form bên trong; gọi `close()` sau khi lưu thành công hoặc bấm Hủy */
  children: (close: () => void) => React.ReactNode;
  className?: string;
};

/** Hộp thoại chứa form CRUD đơn giản (banner, cảm nhận, FAQ, đối tác...). Form được mount lại mỗi lần mở. */
export function FormDialog({ title, description, trigger, children, className }: FormDialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto sm:max-w-xl", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className={description ? undefined : "sr-only"}>{description ?? title}</DialogDescription>
        </DialogHeader>
        {children(() => setOpen(false))}
      </DialogContent>
    </Dialog>
  );
}
