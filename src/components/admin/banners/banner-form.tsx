"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Banner } from "@/generated/prisma/client";
import { bannerSchema, type BannerFormValues } from "@/lib/validations/banner";
import { createBanner, updateBanner } from "@/actions/banners";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { FormDialog } from "@/components/admin/banners/form-dialog";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

export function BannerForm({ banner, onDone }: { banner?: Banner; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      image: banner?.image ?? "",
      ctaText: banner?.ctaText ?? "",
      ctaLink: banner?.ctaLink ?? "",
      ctaText2: banner?.ctaText2 ?? "",
      ctaLink2: banner?.ctaLink2 ?? "",
      order: String(banner?.order ?? 0),
      isActive: banner?.isActive ?? true,
    },
  });

  const onSubmit = (values: BannerFormValues) => {
    startTransition(async () => {
      const result = banner ? await updateBanner(banner.id, values) : await createBanner(values);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        onDone();
      } else {
        toast.error(result.message);
        applyFieldErrors(form, result.fieldErrors);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh banner <span className="text-destructive">*</span></FormLabel>
              <ImageUploadField value={field.value} onChange={(url) => field.onChange(url ?? "")} aspect="wide" />
              <FormDescription>Khuyến nghị ảnh ngang tỷ lệ 21:9, kích thước khoảng 1920×820px.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input {...field} placeholder="Vd: Tuyển 500 lao động đi Nhật Bản năm 2026" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phụ đề</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ""} placeholder="Mô tả ngắn hiển thị dưới tiêu đề" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ctaText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nút 1 – chữ</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="Đăng ký tư vấn" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ctaLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nút 1 – đường dẫn</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="/dang-ky-tu-van" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ctaText2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nút 2 – chữ</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="Xem đơn hàng" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ctaLink2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nút 2 – đường dẫn</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="/don-hang" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thứ tự</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} type="number" inputMode="numeric" /></FormControl>
                <FormDescription>Số nhỏ hiển thị trước.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Hiển thị</FormLabel>
                  <FormDescription>Bật để banner xuất hiện trên trang chủ.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>Hủy</Button>
          <SubmitButton pending={isPending}>{banner ? "Lưu thay đổi" : "Thêm banner"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}

/** Nút mở hộp thoại thêm/sửa banner */
export function BannerFormDialog({ banner }: { banner?: Banner }) {
  return (
    <FormDialog
      title={banner ? "Sửa banner" : "Thêm banner"}
      trigger={
        banner ? (
          <Button variant="ghost" size="icon" aria-label="Sửa banner"><Pencil /></Button>
        ) : (
          <Button><Plus /> Thêm banner</Button>
        )
      }
    >
      {(close) => <BannerForm banner={banner} onDone={close} />}
    </FormDialog>
  );
}
