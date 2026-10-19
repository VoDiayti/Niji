"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/actions/categories";
import { slugify } from "@/lib/slug";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/admin/submit-button";

export type CategoryDialogData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  isActive: boolean;
};

/** Dialog tạo / sửa chuyên mục. `trigger` là nút mở hộp thoại. */
export function CategoryDialog({ category, trigger }: { category?: CategoryDialogData; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {/* Nội dung được mount lại mỗi lần mở → form luôn bắt đầu từ dữ liệu mới nhất */}
        <CategoryDialogForm category={category} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CategoryDialogForm({ category, onDone }: { category?: CategoryDialogData; onDone: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(Boolean(category));

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      order: String(category?.order ?? 0),
      isActive: category?.isActive ?? true,
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    startTransition(async () => {
      const result = category ? await updateCategory(category.id, values) : await createCategory(values);
      if (result.success) {
        toast.success(result.message ?? "Đã lưu chuyên mục");
        onDone();
        router.refresh();
        return;
      }
      toast.error(result.message);
      for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (name in form.getValues() && messages[0]) form.setError(name as keyof CategoryFormValues, { message: messages[0] });
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{category ? "Sửa chuyên mục" : "Thêm chuyên mục"}</DialogTitle>
        <DialogDescription>Chuyên mục dùng để nhóm các bài viết trong mục Tin tức.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên chuyên mục <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Vd: Kinh nghiệm"
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
                <FormDescription>/tin-tuc/chuyen-muc/{field.value || "..."}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} placeholder="Mô tả ngắn hiển thị ở đầu trang chuyên mục" />
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
                  <FormDescription>Số nhỏ hiển thị trước.</FormDescription>
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
                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Hiển thị chuyên mục" />
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
