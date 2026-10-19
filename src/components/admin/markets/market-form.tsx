"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Market } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";
import { marketSchema, type MarketFormValues } from "@/lib/validations/market";
import { createMarket, updateMarket } from "@/actions/markets";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";
import { parseStringList } from "@/lib/format";

const LIST_PATH = "/admin/thi-truong";

export function MarketForm({ initialData }: { initialData?: Market }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Slug tự sinh từ tên cho tới khi người dùng sửa tay (bản ghi đang sửa: giữ slug cũ)
  const [slugLocked, setSlugLocked] = useState(!!initialData);

  const form = useForm<MarketFormValues>({
    resolver: zodResolver(marketSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      countryCode: initialData?.countryCode ?? "",
      image: initialData?.image ?? null,
      summary: initialData?.summary ?? "",
      description: initialData?.description ?? "",
      requirements: initialData?.requirements ?? "",
      salaryRange: initialData?.salaryRange ?? "",
      cost: initialData?.cost ?? "",
      duration: initialData?.duration ?? "",
      industriesText: parseStringList(initialData?.industries).join("\n"),
      highlightsText: parseStringList(initialData?.highlights).join("\n"),
      isFeatured: initialData?.isFeatured ?? false,
      isActive: initialData?.isActive ?? true,
      order: String(initialData?.order ?? 0),
      metaTitle: initialData?.metaTitle ?? "",
      metaDescription: initialData?.metaDescription ?? "",
    },
  });

  const onSubmit = (values: MarketFormValues) => {
    startTransition(async () => {
      const result = initialData ? await updateMarket(initialData.id, values) : await createMarket(values);
      if (result.success) {
        toast.success(result.message);
        router.push(LIST_PATH);
        router.refresh();
      } else {
        toast.error(result.message);
        applyFieldErrors(form, result.fieldErrors);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cột chính */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên thị trường <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Vd: Nhật Bản"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!slugLocked) form.setValue("slug", slugify(e.target.value), { shouldValidate: false });
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đường dẫn (slug)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="tu-sinh-tu-ten"
                            onChange={(e) => {
                              field.onChange(e);
                              setSlugLocked(e.target.value.trim() !== "");
                            }}
                          />
                        </FormControl>
                        <FormDescription>Địa chỉ trang: /thi-truong/{field.value || "…"}. Để trống để tự sinh từ tên.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TextField control={form.control} name="countryCode" label="Mã quốc gia" placeholder="JP" maxLength={2} description="ISO-2, dùng hiện cờ." />
                </div>
                <TextField control={form.control} name="summary" label="Tóm tắt" multiline rows={3} placeholder="Giới thiệu ngắn 1–2 câu hiển thị ở danh sách thị trường" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nội dung chi tiết</CardTitle>
                <CardDescription>Hiển thị trên trang chi tiết thị trường.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả thị trường</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={280} placeholder="Tổng quan về thị trường, môi trường làm việc, văn hóa..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điều kiện tham gia</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={220} placeholder="Độ tuổi, trình độ, sức khỏe, ngoại ngữ..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin chương trình</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField control={form.control} name="salaryRange" label="Mức lương" placeholder="Vd: 28 – 35 triệu/tháng" />
                  <TextField control={form.control} name="cost" label="Chi phí" placeholder="Vd: Từ 90 triệu" />
                  <TextField control={form.control} name="duration" label="Thời gian hợp đồng" placeholder="Vd: 3 năm, gia hạn 5 năm" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    control={form.control}
                    name="industriesText"
                    label="Ngành nghề phổ biến"
                    multiline
                    rows={6}
                    placeholder={"Mỗi dòng một ngành, vd:\nCơ khí\nChế biến thực phẩm\nXây dựng"}
                    description="Mỗi dòng một mục."
                  />
                  <TextField
                    control={form.control}
                    name="highlightsText"
                    label="Ưu điểm nổi bật"
                    multiline
                    rows={6}
                    placeholder={"Mỗi dòng một ưu điểm, vd:\nThu nhập cao, ổn định\nChi phí minh bạch"}
                    description="Mỗi dòng một mục."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột phụ */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiển thị</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Hiển thị trên website</FormLabel>
                        <FormDescription>Tắt để tạm ẩn thị trường.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Thị trường nổi bật</FormLabel>
                        <FormDescription>Hiện ở trang chủ.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <TextField control={form.control} name="order" label="Thứ tự" type="number" inputMode="numeric" description="Số nhỏ hiển thị trước." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <ImageUploadField value={field.value} onChange={field.onChange} aspect="video" />
                      <FormDescription>Ảnh ngang tỷ lệ 16:9, tối thiểu 1200×675px.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Để trống sẽ dùng tên và tóm tắt.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextField control={form.control} name="metaTitle" label="Tiêu đề SEO" placeholder="Tối đa ~60 ký tự" maxLength={160} />
                <TextField control={form.control} name="metaDescription" label="Mô tả SEO" multiline rows={3} placeholder="Tối đa ~160 ký tự" maxLength={320} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <Button type="button" variant="outline" asChild><Link href={LIST_PATH}>Hủy</Link></Button>
          <SubmitButton pending={isPending} className="min-w-28">{initialData ? "Lưu thay đổi" : "Tạo thị trường"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}
