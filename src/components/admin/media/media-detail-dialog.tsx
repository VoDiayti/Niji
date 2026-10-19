"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, LoaderCircle, Save, Trash } from "lucide-react";
import { toast } from "sonner";
import { deleteMediaAction, updateMediaAlt } from "@/actions/media";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatBytes, mimeLabel, type MediaItem } from "@/components/admin/media/media-types";

type MediaDetailDialogProps = {
  item: MediaItem | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: (id: string) => void;
};

/** Hộp thoại chi tiết ảnh: xem lớn, thông tin, sao chép URL, sửa alt, xóa */
export function MediaDetailDialog({ item, onOpenChange, onDeleted }: MediaDetailDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        {item && <MediaDetailBody key={item.id} item={item} onClose={() => onOpenChange(false)} onDeleted={onDeleted} />}
      </DialogContent>
    </Dialog>
  );
}

function MediaDetailBody({ item, onClose, onDeleted }: { item: MediaItem; onClose: () => void; onDeleted?: (id: string) => void }) {
  const router = useRouter();
  const [alt, setAlt] = useState(item.alt ?? "");
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();
  // Chỉ đọc window khi đã ở client (dialog chỉ mở sau tương tác người dùng)
  const [origin] = useState(() => (typeof window === "undefined" ? "" : window.location.origin));
  const absoluteUrl = item.url.startsWith("/") ? `${origin}${item.url}` : item.url;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      toast.success("Đã sao chép đường dẫn ảnh");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không sao chép được, vui lòng chọn và sao chép thủ công.");
    }
  };

  const saveAlt = () => {
    startSaving(async () => {
      const result = await updateMediaAlt(item.id, alt);
      if (result.success) {
        toast.success(result.message ?? "Đã lưu");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const remove = () => {
    startDeleting(async () => {
      const result = await deleteMediaAction(item.id);
      if (result.success) {
        toast.success(result.message ?? "Đã xóa ảnh");
        setConfirmOpen(false);
        onClose();
        onDeleted?.(item.id);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="truncate pr-6">{item.filename}</DialogTitle>
        <DialogDescription>Chi tiết ảnh trong thư viện</DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-h-64 items-center justify-center overflow-hidden rounded-lg border bg-muted/40 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- ảnh upload bất kỳ trong admin */}
          <img src={item.url} alt={item.alt ?? ""} className="max-h-[60vh] w-auto max-w-full rounded object-contain" />
        </div>

        <div className="space-y-5">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">Kích thước</dt>
            <dd>{item.width && item.height ? `${item.width} × ${item.height} px` : "—"}</dd>
            <dt className="text-muted-foreground">Dung lượng</dt>
            <dd>{formatBytes(item.size)}</dd>
            <dt className="text-muted-foreground">Loại</dt>
            <dd>{mimeLabel(item.mimeType)}</dd>
            <dt className="text-muted-foreground">Ngày tải</dt>
            <dd>{formatDateTime(item.createdAt)}</dd>
            <dt className="text-muted-foreground">Người tải</dt>
            <dd>{item.uploadedBy ?? "—"}</dd>
          </dl>

          <div className="space-y-1.5">
            <Label htmlFor={`media-url-${item.id}`}>Đường dẫn (URL)</Label>
            <div className="flex gap-1.5">
              <Input id={`media-url-${item.id}`} value={absoluteUrl} readOnly onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
              <Button type="button" variant="outline" size="icon" onClick={() => void copyUrl()} aria-label="Sao chép đường dẫn">
                {copied ? <Check className="text-emerald-600" /> : <Copy />}
              </Button>
              <Button type="button" variant="outline" size="icon" asChild>
                <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="Mở ảnh trong tab mới"><ExternalLink /></a>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`media-alt-${item.id}`}>Mô tả ảnh (alt)</Label>
            <div className="flex gap-1.5">
              <Input id={`media-alt-${item.id}`} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Mô tả ngắn cho SEO và người khiếm thị" maxLength={300} />
              <Button type="button" size="icon" onClick={saveAlt} disabled={saving || alt === (item.alt ?? "")} aria-label="Lưu mô tả">
                {saving ? <LoaderCircle className="animate-spin" /> : <Save />}
              </Button>
            </div>
          </div>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="w-full text-destructive hover:text-destructive">
                <Trash /> Xóa ảnh
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa ảnh này?</AlertDialogTitle>
                <AlertDialogDescription>
                  File sẽ bị xóa khỏi kho lưu trữ. Bài viết hoặc banner đang dùng ảnh này sẽ bị mất ảnh. Hành động không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  onClick={(e) => {
                    e.preventDefault();
                    remove();
                  }}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {deleting && <LoaderCircle className="animate-spin" />} Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
