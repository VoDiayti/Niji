"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Testimonial } from "@/db/types";
import { RATING_OPTIONS, testimonialSchema, type TestimonialFormValues } from "@/lib/validations/testimonial";
import { createTestimonial, updateTestimonial } from "@/actions/testimonials";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { FormDialog } from "@/components/admin/banners/form-dialog";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

export function TestimonialForm({ testimonial, onDone }: { testimonial?: Testimonial; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: testimonial?.name ?? "",
      position: testimonial?.position ?? "",
      content: testimonial?.content ?? "",
      avatar: testimonial?.avatar ?? null,
      rating: String(testimonial?.rating ?? 5) as (typeof RATING_OPTIONS)[number],
      order: String(testimonial?.order ?? 0),
      isActive: testimonial?.isActive ?? true,
    },
  });

  const onSubmit = (values: TestimonialFormValues) => {
    startTransition(async () => {
      const result = testimonial ? await updateTestimonial(testimonial.id, values) : await createTestimonial(values);
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
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ảnh đại diện</FormLabel>
                <ImageUploadField value={field.value} onChange={field.onChange} aspect="square" />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên học viên <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} placeholder="Vd: Nguyễn Văn An" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vị trí / chương trình</FormLabel>
                  <FormControl><Input {...field} value={field.value ?? ""} placeholder="Vd: Thực tập sinh cơ khí – Osaka, Nhật Bản" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đánh giá</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Chọn số sao" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {RATING_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{"★".repeat(Number(r))}{"☆".repeat(5 - Number(r))} · {r} sao</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung cảm nhận <span className="text-destructive">*</span></FormLabel>
              <FormControl><Textarea {...field} rows={5} placeholder="Chia sẻ của học viên về quá trình đào tạo, xuất cảnh, công việc..." /></FormControl>
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
                  <FormDescription>Bật để hiện trên trang chủ.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>Hủy</Button>
          <SubmitButton pending={isPending}>{testimonial ? "Lưu thay đổi" : "Thêm cảm nhận"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}

export function TestimonialFormDialog({ testimonial }: { testimonial?: Testimonial }) {
  return (
    <FormDialog
      title={testimonial ? "Sửa cảm nhận" : "Thêm cảm nhận học viên"}
      trigger={
        testimonial ? (
          <Button variant="ghost" size="icon" aria-label="Sửa cảm nhận"><Pencil /></Button>
        ) : (
          <Button><Plus /> Thêm cảm nhận</Button>
        )
      }
    >
      {(close) => <TestimonialForm testimonial={testimonial} onDone={close} />}
    </FormDialog>
  );
}
