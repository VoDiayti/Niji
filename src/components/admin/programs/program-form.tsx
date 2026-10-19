"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { createProgram, updateProgram } from "@/actions/programs";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { PROGRAM_TYPE_LABELS } from "@/lib/constants";
import { PROGRAM_TYPE_VALUES, programSchema, type ProgramFormValues } from "@/lib/validations/program";
import type { ProgramType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/admin/submit-button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ImageFieldWithLibrary } from "@/components/admin/media/image-field-with-library";

export type ProgramFormInitialData = {
  id: string;
  title: string;
  slug: string;
  type: ProgramType;
  summary: string | null;
  content: string;
  image: string | null;
  duration: string | null;
  tuition: string | null;
  order: number;
  isActive: boolean;
};

function toDefaults(data?: ProgramFormInitialData): ProgramFormValues {
  return {
    title: data?.title ?? "",
    slug: data?.slug ?? "",
    type: data?.type ?? "LANGUAGE",
    summary: data?.summary ?? "",
    content: data?.content ?? "",
    image: data?.image ?? "",
    duration: data?.duration ?? "",
    tuition: data?.tuition ?? "",
    order: String(data?.order ?? 0),
    isActive: data?.isActive ?? true,
  };
}

/** Form tạo / sửa chương trình du học – đào tạo */
export function ProgramForm({ initialData }: { initialData?: ProgramFormInitialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const slugTouched = useRef(Boolean(initialData));

  const form = useForm<ProgramFormValues>({ resolver: zodResolver(programSchema), defaultValues: toDefaults(initialData) });
  const summary = useWatch({ control: form.control, name: "summary" });

  const onSubmit = (values: ProgramFormValues) => {
    startTransition(async () => {
      const result = initialData ? await updateProgram(initialData.id, values) : await createProgram(values);
      if (!result.success) {
        toast.error(result.message);
        for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (name in form.getValues() && messages[0]) form.setError(name as keyof ProgramFormValues, { message: messages[0] });
        }
        return;
      }
      toast.success(result.message ?? "Đã lưu chương trình");
      if (!initialData) {
        router.push(result.data ? `/admin/dao-tao/${result.data.id}` : "/admin/dao-tao");
        return;
      }
      if (result.data) form.setValue("slug", result.data.slug);
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Thông tin chương trình</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Vd: Du học nghề Đức – Ngành Điều dưỡng"
                          className="h-11 font-semibold md:text-base"
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
                      <div className="flex">
                        <span className="hidden items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground sm:flex">/du-hoc-dao-tao/</span>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="tu-sinh-tu-tieu-de"
                            className="sm:rounded-l-none"
                            onChange={(e) => {
                              slugTouched.current = e.target.value.trim().length > 0;
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Tự sinh từ tiêu đề khi để trống.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tóm tắt</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Giới thiệu ngắn hiển thị ở danh sách chương trình" />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Hiển thị ở danh sách chương trình.</span>
                        <span className={cn(summary.length > 500 && "text-destructive")}>{summary.length}/500</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung chi tiết</FormLabel>
                      <RichTextEditor value={field.value} onChange={field.onChange} minHeight={380} placeholder="Mô tả chương trình, quyền lợi, điều kiện tham gia..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Cài đặt</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại chương trình</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROGRAM_TYPE_VALUES.map((t) => (
                            <SelectItem key={t} value={t}>{PROGRAM_TYPE_LABELS[t]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời lượng</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vd: 4 tháng, học toàn thời gian" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tuition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học phí</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vd: Miễn phí cho học viên đăng ký đơn hàng" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <div className="space-y-0.5">
                        <FormLabel>Hiển thị trên website</FormLabel>
                        <FormDescription>Tắt để tạm ẩn chương trình.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Hiển thị chương trình" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ảnh minh họa</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <ImageFieldWithLibrary value={field.value || null} onChange={(url) => field.onChange(url ?? "")} aspect="video" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/dao-tao"><ArrowLeft /> Danh sách chương trình</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {initialData?.isActive && (
              <Button type="button" variant="outline" asChild>
                <Link href={`/du-hoc-dao-tao/${initialData.slug}`} target="_blank"><ExternalLink /> Xem trên website</Link>
              </Button>
            )}
            <SubmitButton pending={isPending} pendingText="Đang lưu..." className="min-w-28">Lưu</SubmitButton>
          </div>
        </div>
      </form>
    </Form>
  );
}
