"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImage, type UploadedImage } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";

type MediaUploadButtonProps = {
  /** Gọi sau khi tải xong (chỉ các ảnh thành công) */
  onUploaded?: (items: UploadedImage[]) => void;
  /** Làm mới dữ liệu trang sau khi tải xong (mặc định: có) */
  refreshOnDone?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  label?: string;
};

/** Nút tải nhiều ảnh lên thư viện, hiển thị tiến trình theo số file */
export function MediaUploadButton({ onUploaded, refreshOnDone = true, variant = "default", size = "default", className, label = "Tải ảnh lên" }: MediaUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setProgress({ done: 0, total: files.length });
    const uploaded: UploadedImage[] = [];
    for (const file of files) {
      try {
        uploaded.push(await uploadImage(file));
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "Upload ảnh thất bại"}`);
      }
      setProgress((p) => ({ done: (p?.done ?? 0) + 1, total: files.length }));
    }
    setProgress(null);
    if (uploaded.length > 0) {
      toast.success(`Đã tải lên ${uploaded.length}/${files.length} ảnh`);
      onUploaded?.(uploaded);
      if (refreshOnDone) router.refresh();
    }
  };

  const percent = progress ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Button type="button" variant={variant} size={size} disabled={progress !== null} onClick={() => inputRef.current?.click()}>
        {progress ? <LoaderCircle className="animate-spin" /> : <Upload />}
        {progress ? `Đang tải ${progress.done}/${progress.total}...` : label}
      </Button>
      {progress && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến trình tải ảnh">
          <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          void handleFiles(files);
        }}
      />
    </div>
  );
}
