"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLeadNote } from "@/actions/leads";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/submit-button";

const MAX = 2000;

/** Ghi chú nội bộ của tư vấn viên về một đăng ký */
export function LeadNoteForm({ id, note }: { id: string; note: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(note ?? "");
  const [isPending, startTransition] = useTransition();
  const dirty = value.trim() !== (note ?? "").trim();

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await updateLeadNote(id, value);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        maxLength={MAX}
        placeholder="Vd: Đã gọi lúc 9h, khách muốn đi Nhật ngành cơ khí, hẹn gọi lại thứ 5..."
        aria-label="Ghi chú nội bộ"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{value.length}/{MAX} · Chỉ nội bộ, khách không nhìn thấy.</span>
        <SubmitButton pending={isPending} size="sm" disabled={!dirty}>Lưu ghi chú</SubmitButton>
      </div>
    </form>
  );
}
