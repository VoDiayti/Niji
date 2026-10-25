"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createJobProgram, updateJobProgram } from "@/actions/job-programs";
import { slugify } from "@/lib/slug";
import { jobProgramSchema, type JobProgramFormValues } from "@/lib/validations/job-program";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/admin/submit-button";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

export type JobProgramDialogData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
};

/** Dialog tạo / sửa chương trình (tab bảng đơn hàng trang chủ). `trigger` là nút mở hộp thoại. */
export function JobProgramDialog({ program, trigger }: { program?: JobProgramDialogData; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {/* Nội dung được mount lại mỗi lần mở → form luôn bắt đầu từ dữ liệu mới nhất */}
        <JobProgramDialogForm program={program} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function JobProgramDialogForm({ program, onDone }: { program?: JobProgramDialogData; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(Boolean(program));

  const form = useForm<JobProgramFormValues>({
    resolver: zodResolver(jobProgramSchema),
    defaultValues: {
      name: program?.name ?? "",
      slug: program?.slug ?? "",
      description: program?.description ?? "",
      order: String(program?.order ?? 0),
      isActive: program?.isActive ?? true,
    },
  });

  const onSubmit = (values: JobProgramFormValues) => {
    startTransition(async () => {
      const result = program ? await updateJobProgram(program.id, values) : await createJobProgram(values);
      if (result.success) {
        toast.success(result.message ?? "Đã lưu chương trình");
        onDone();
        router.refresh();
        return;
      }
      toast.error(result.message);
      applyFieldErrors(form, result.fieldErrors);
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{program ? "Sửa chương trình" : "Thêm chương trình"}</DialogTitle>
        <DialogDescription>Mỗi chương trình là một tab trong bảng đơn hàng ở trang chủ (vd: Thực tập sinh, Kỹ năng đặc định, Điều dưỡng).</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên chương trình <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Vd: Kỹ năng đặc định"
                    autoFocus
                    onChange={(e) => {
                      field.onChange(e);
                      if (!slugTouched.current) form.setValue("slug", slugify(e.target.value), { shouldDirty: true });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đường dẫn (slug)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="tu-sinh-tu-ten"
                    onChange={(e) => {
                      slugTouched.current = e.target.value.trim().length > 0;
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>Bộ lọc công khai: /don-hang?chuong-trinh={field.value || "..."}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả ngắn</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} placeholder="Một câu ngắn hiển thị dưới bảng của tab này ở trang chủ" />
                </FormControl>
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
                  <FormControl>
                    <Input {...field} inputMode="numeric" placeholder="0" />
                  </FormControl>
                  <FormDescription>Số nhỏ xếp tab trước.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-3 rounded-lg border p-3">
                  <FormLabel>Hiển thị</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Hiển thị chương trình" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>Hủy</Button>
            <SubmitButton pending={isPending} pendingText="Đang lưu...">Lưu</SubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
