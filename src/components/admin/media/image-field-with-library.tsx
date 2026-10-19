"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { Button } from "@/components/ui/button";

type ImageFieldWithLibraryProps = React.ComponentProps<typeof ImageUploadField>;

/** Trường ảnh = ImageUploadField + nút "Chọn từ thư viện" (mở MediaPickerDialog) */
export function ImageFieldWithLibrary({ value, onChange, disabled, ...props }: ImageFieldWithLibraryProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <ImageUploadField value={value} onChange={onChange} disabled={disabled} {...props} />
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setOpen(true)}>
        <Images /> Chọn từ thư viện
      </Button>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onSelect={(url) => onChange(url)} />
    </div>
  );
}
