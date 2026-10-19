"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Link2, LoaderCircle, Trash, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ImageUploadFieldProps = {
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Tỷ lệ khung xem trước */
  aspect?: "video" | "square" | "wide" | "auto";
  disabled?: boolean;
  className?: string;
};

/** Trường chọn ảnh: upload từ máy, dán URL hoặc xóa. Dùng trong các form admin. */
export function ImageUploadField({ value, onChange, aspect = "video", disabled, className }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [url, setUrl] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImage(file);
      onChange(uploaded.url);
      toast.success("Đã tải ảnh lên");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const aspectClass = { video: "aspect-video", square: "aspect-square", wide: "aspect-[21/9]", auto: "" }[aspect];

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40",
          aspectClass,
          aspect === "auto" && "min-h-40"
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled) void handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL ảnh bất kỳ trong admin, không qua next/image
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-1 p-6 text-center text-sm text-muted-foreground">
            <ImageIcon className="size-8 opacity-50" />
            <span>Kéo thả ảnh vào đây hoặc bấm &quot;Tải ảnh lên&quot;</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <LoaderCircle className="size-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          <Upload /> Tải ảnh lên
        </Button>
        <Popover open={urlOpen} onOpenChange={setUrlOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={disabled}>
              <Link2 /> Dán URL
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 space-y-2" align="start">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() => {
                if (url.trim()) onChange(url.trim());
                setUrl("");
                setUrlOpen(false);
              }}
            >
              Dùng ảnh này
            </Button>
          </PopoverContent>
        </Popover>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" disabled={disabled} onClick={() => onChange(null)}>
            <Trash /> Xóa ảnh
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void handleFile(file);
        }}
      />
    </div>
  );
}
