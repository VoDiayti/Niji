"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTag, updateTag } from "@/actions/tags";
import { slugify } from "@/lib/slug";
import { tagSchema, type TagFormValues } from "@/lib/validations/tag";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/admin/submit-button";

export type TagDialogData = { id: string; name: string; slug: string };

/** Dialog tạo / sửa thẻ (tag). `trigger` là nút mở hộp thoại. */
export function TagDialog({ tag, trigger }: { tag?: TagDialogData; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <TagDialogForm tag={tag} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TagDialogForm({ tag, onDone }: { tag?: TagDialogData; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(Boolean(tag));

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: tag?.name ?? "", slug: tag?.slug ?? "" },
  });

  const onSubmit = (values: TagFormValues) => {
    startTransition(async () => {
      const result = tag ? await updateTag(tag.id, values) : await createTag(values);
      if (result.success) {
        toast.success(result.message ?? "Đã lưu thẻ");
        onDone();
        router.refresh();
        return;
      }
      toast.error(result.message);
      for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (name in form.getValues() && messages[0]) form.setError(name as keyof TagFormValues, { message: messages[0] });
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{tag ? "Sửa thẻ" : "Thêm thẻ"}</DialogTitle>
        <DialogDescription>Thẻ giúp gắn nhãn chủ đề cho bài viết (vd: Nhật Bản, Visa).</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên thẻ <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Vd: Nhật Bản"
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
                <FormDescription>/tin-tuc/the/{field.value || "..."}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone} disabled={isPending}>Hủy</Button>
            <SubmitButton pending={isPending} pendingText="Đang lưu...">Lưu</SubmitButton>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
