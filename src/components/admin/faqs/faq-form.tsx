"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Faq } from "@/generated/prisma/client";
import { faqSchema, type FaqFormValues } from "@/lib/validations/faq";
import { createFaq, updateFaq } from "@/actions/faqs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/admin/submit-button";
import { FormDialog } from "@/components/admin/banners/form-dialog";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

export function FaqForm({ faq, onDone }: { faq?: Faq; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: faq?.question ?? "",
      answer: faq?.answer ?? "",
      order: String(faq?.order ?? 0),
      isActive: faq?.isActive ?? true,
    },
  });

  const onSubmit = (values: FaqFormValues) => {
    startTransition(async () => {
      const result = faq ? await updateFaq(faq.id, values) : await createFaq(values);
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
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Câu hỏi <span className="text-destructive">*</span></FormLabel>
              <FormControl><Input {...field} placeholder="Vd: Chi phí đi Nhật Bản hiện nay là bao nhiêu?" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Câu trả lời <span className="text-destructive">*</span></FormLabel>
              <FormControl><Textarea {...field} rows={6} placeholder="Trả lời ngắn gọn, rõ ràng, dễ hiểu với người lao động..." /></FormControl>
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
                  <FormDescription>Bật để hiện trên trang Hỏi đáp.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>Hủy</Button>
          <SubmitButton pending={isPending}>{faq ? "Lưu thay đổi" : "Thêm câu hỏi"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}

export function FaqFormDialog({ faq }: { faq?: Faq }) {
  return (
    <FormDialog
      title={faq ? "Sửa câu hỏi" : "Thêm câu hỏi thường gặp"}
      trigger={
        faq ? (
          <Button variant="ghost" size="icon" aria-label="Sửa câu hỏi"><Pencil /></Button>
        ) : (
          <Button><Plus /> Thêm câu hỏi</Button>
        )
      }
    >
      {(close) => <FaqForm faq={faq} onDone={close} />}
    </FormDialog>
  );
}
