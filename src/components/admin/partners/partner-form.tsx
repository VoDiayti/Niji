"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Partner } from "@/db/types";
import { partnerSchema, type PartnerFormValues } from "@/lib/validations/partner";
import { createPartner, updatePartner } from "@/actions/partners";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { FormDialog } from "@/components/admin/banners/form-dialog";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

export function PartnerForm({ partner, onDone }: { partner?: Partner; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: partner?.name ?? "",
      logo: partner?.logo ?? null,
      website: partner?.website ?? "",
      order: String(partner?.order ?? 0),
      isActive: partner?.isActive ?? true,
    },
  });

  const onSubmit = (values: PartnerFormValues) => {
    startTransition(async () => {
      const result = partner ? await updatePartner(partner.id, values) : await createPartner(values);
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
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo</FormLabel>
              <ImageUploadField value={field.value} onChange={field.onChange} aspect="video" className="max-w-xs" />
              <FormDescription>Nên dùng ảnh PNG nền trong suốt hoặc nền trắng.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đối tác <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input {...field} placeholder="Vd: Nghiệp đoàn Kyodo Kumiai" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ""} type="url" placeholder="https://..." /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  <FormDescription>Bật để hiện trong dải logo đối tác.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>Hủy</Button>
          <SubmitButton pending={isPending}>{partner ? "Lưu thay đổi" : "Thêm đối tác"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}

export function PartnerFormDialog({ partner }: { partner?: Partner }) {
  return (
    <FormDialog
      title={partner ? "Sửa đối tác" : "Thêm đối tác"}
      trigger={
        partner ? (
          <Button variant="ghost" size="icon" aria-label="Sửa đối tác"><Pencil /></Button>
        ) : (
          <Button><Plus /> Thêm đối tác</Button>
        )
      }
    >
      {(close) => <PartnerForm partner={partner} onDone={close} />}
    </FormDialog>
  );
}
