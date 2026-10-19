"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import type { JobOrder } from "@/generated/prisma/client";
import { slugify } from "@/lib/slug";
import { GENDER_LABELS, JOB_STATUS_LABELS } from "@/lib/constants";
import { JOB_GENDERS, JOB_STATUSES, jobSchema, type JobFormValues } from "@/lib/validations/job";
import { createJob, updateJob } from "@/actions/jobs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

const LIST_PATH = "/admin/don-hang";
const INDUSTRY_LIST_ID = "job-industry-options";

type JobFormProps = {
  initialData?: JobOrder;
  markets: { id: string; name: string }[];
  /** Các ngành nghề đã có để gợi ý */
  industries: string[];
};

const toDateInput = (d: Date | null | undefined) => (d ? format(d, "yyyy-MM-dd") : "");

export function JobForm({ initialData, markets, industries }: JobFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugLocked, setSlugLocked] = useState(!!initialData);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      marketId: initialData?.marketId ?? "",
      industry: initialData?.industry ?? "",
      quantity: String(initialData?.quantity ?? 1),
      gender: initialData?.gender ?? "ANY",
      ageMin: initialData?.ageMin != null ? String(initialData.ageMin) : "",
      ageMax: initialData?.ageMax != null ? String(initialData.ageMax) : "",
      salaryText: initialData?.salaryText ?? "",
      salaryVnd: initialData?.salaryVnd != null ? String(initialData.salaryVnd) : "",
      cost: initialData?.cost ?? "",
      location: initialData?.location ?? "",
      deadline: toDateInput(initialData?.deadline),
      interviewDate: toDateInput(initialData?.interviewDate),
      departureNote: initialData?.departureNote ?? "",
      description: initialData?.description ?? "",
      requirements: initialData?.requirements ?? "",
      benefits: initialData?.benefits ?? "",
      image: initialData?.image ?? null,
      status: initialData?.status ?? "OPEN",
      isFeatured: initialData?.isFeatured ?? false,
    },
  });

  const onSubmit = (values: JobFormValues) => {
    startTransition(async () => {
      const result = initialData ? await updateJob(initialData.id, values) : await createJob(values);
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
        <datalist id={INDUSTRY_LIST_ID}>
          {industries.map((i) => <option key={i} value={i} />)}
        </datalist>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Vd: Tuyển 30 nam cơ khí chế tạo – Osaka, Nhật Bản"
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
                          placeholder="tu-sinh-tu-tieu-de"
                          onChange={(e) => {
                            field.onChange(e);
                            setSlugLocked(e.target.value.trim() !== "");
                          }}
                        />
                      </FormControl>
                      <FormDescription>Địa chỉ trang: /don-hang/{field.value || "…"}. Để trống để tự sinh.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="marketId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thị trường <span className="text-destructive">*</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Chọn thị trường" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {markets.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {markets.length === 0 && <FormDescription>Chưa có thị trường nào – hãy <Link href="/admin/thi-truong/moi" className="underline">tạo thị trường</Link> trước.</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TextField control={form.control} name="industry" label="Ngành nghề" required placeholder="Vd: Cơ khí" list={INDUSTRY_LIST_ID} description="Gõ để chọn ngành đã có hoặc nhập ngành mới." />
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  <TextField control={form.control} name="quantity" label="Số lượng" type="number" inputMode="numeric" placeholder="1" />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {JOB_GENDERS.map((g) => <SelectItem key={g} value={g}>{GENDER_LABELS[g]}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <TextField control={form.control} name="ageMin" label="Tuổi từ" type="number" inputMode="numeric" placeholder="18" />
                  <TextField control={form.control} name="ageMax" label="Tuổi đến" type="number" inputMode="numeric" placeholder="35" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField control={form.control} name="salaryText" label="Mức lương hiển thị" placeholder="Vd: 160.000 – 180.000 Yên/tháng" />
                  <TextField
                    control={form.control}
                    name="salaryVnd"
                    label="Lương quy đổi (VNĐ/tháng)"
                    inputMode="numeric"
                    placeholder="Vd: 28000000"
                    description="Chỉ nhập số, dùng cho bộ lọc mức lương."
                  />
                  <TextField control={form.control} name="cost" label="Chi phí" placeholder="Vd: Trọn gói 95 triệu" />
                  <TextField control={form.control} name="location" label="Nơi làm việc" placeholder="Vd: Osaka, Nhật Bản" />
                  <TextField control={form.control} name="deadline" label="Hạn nộp hồ sơ" type="date" />
                  <TextField control={form.control} name="interviewDate" label="Ngày phỏng vấn" type="date" />
                </div>
                <TextField control={form.control} name="departureNote" label="Ghi chú xuất cảnh" placeholder="Vd: Dự kiến xuất cảnh sau 4–6 tháng kể từ ngày đỗ" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nội dung chi tiết</CardTitle>
                <CardDescription>Hiển thị trên trang chi tiết đơn hàng.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả công việc</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={260} placeholder="Công việc cụ thể, thời gian làm việc, môi trường..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yêu cầu</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={200} placeholder="Trình độ, kinh nghiệm, sức khỏe, ngoại ngữ..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quyền lợi</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={200} placeholder="Lương, thưởng, bảo hiểm, chỗ ở, hỗ trợ..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái tuyển dụng</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JOB_STATUSES.map((s) => <SelectItem key={s} value={s}>{JOB_STATUS_LABELS[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormDescription>Chỉ đơn hàng “Đang tuyển” hiển thị trên website.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Đơn hàng nổi bật</FormLabel>
                        <FormDescription>Ưu tiên hiện ở trang chủ.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ảnh đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <ImageUploadField value={field.value} onChange={field.onChange} aspect="video" />
                      <FormDescription>Để trống sẽ dùng ảnh của thị trường.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <Button type="button" variant="outline" asChild><Link href={LIST_PATH}>Hủy</Link></Button>
          <SubmitButton pending={isPending} className="min-w-28">{initialData ? "Lưu thay đổi" : "Tạo đơn hàng"}</SubmitButton>
        </div>
      </form>
    </Form>
  );
}
