"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Setting } from "@/generated/prisma/client";
import { settingsSchema, type SettingsFormValues } from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmitButton } from "@/components/admin/submit-button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

type FieldName = keyof SettingsFormValues;

/** Nhóm trường theo tab – dùng để nhảy tới tab có lỗi khi submit */
const TABS: { value: string; label: string; fields: FieldName[] }[] = [
  { value: "company", label: "Thông tin công ty", fields: ["companyName", "shortName", "slogan", "logo", "licenseNumber", "licenseIssuer", "taxCode", "foundedYear"] },
  { value: "contact", label: "Liên hệ", fields: ["hotline", "zalo", "email", "address", "mapEmbedUrl", "workingHours"] },
  { value: "social", label: "Mạng xã hội", fields: ["facebook", "youtube", "tiktok", "messenger"] },
  { value: "stats", label: "Số liệu nổi bật", fields: ["statWorkers", "statYears", "statPartners", "statMarkets"] },
  { value: "about", label: "Giới thiệu", fields: ["aboutShort", "aboutContent", "vision", "mission"] },
  { value: "seo", label: "SEO", fields: ["metaTitle", "metaDescription", "ogImage"] },
];

const str = (v: string | number | null | undefined) => (v == null ? "" : String(v));

export function SettingsForm({ initialData }: { initialData: Setting }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState(TABS[0].value);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: str(initialData.companyName),
      shortName: str(initialData.shortName),
      slogan: str(initialData.slogan),
      logo: initialData.logo ?? null,
      licenseNumber: str(initialData.licenseNumber),
      licenseIssuer: str(initialData.licenseIssuer),
      taxCode: str(initialData.taxCode),
      foundedYear: str(initialData.foundedYear),
      hotline: str(initialData.hotline),
      zalo: str(initialData.zalo),
      email: str(initialData.email),
      address: str(initialData.address),
      mapEmbedUrl: str(initialData.mapEmbedUrl),
      workingHours: str(initialData.workingHours),
      facebook: str(initialData.facebook),
      youtube: str(initialData.youtube),
      tiktok: str(initialData.tiktok),
      messenger: str(initialData.messenger),
      statWorkers: str(initialData.statWorkers),
      statYears: str(initialData.statYears),
      statPartners: str(initialData.statPartners),
      statMarkets: str(initialData.statMarkets),
      aboutShort: str(initialData.aboutShort),
      aboutContent: str(initialData.aboutContent),
      vision: str(initialData.vision),
      mission: str(initialData.mission),
      metaTitle: str(initialData.metaTitle),
      metaDescription: str(initialData.metaDescription),
      ogImage: initialData.ogImage ?? null,
    },
  });

  const mapEmbedUrl = useWatch({ control: form.control, name: "mapEmbedUrl" });

  /** Chuyển sang tab chứa trường lỗi đầu tiên */
  const focusErrorTab = (names: string[]) => {
    const target = TABS.find((t) => t.fields.some((f) => names.includes(f)));
    if (target) setTab(target.value);
  };

  const onInvalid = (errors: FieldErrors<SettingsFormValues>) => {
    focusErrorTab(Object.keys(errors));
    toast.error("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
  };

  const onSubmit = (values: SettingsFormValues) => {
    startTransition(async () => {
      const result = await updateSettings(values);
      if (result.success) {
        toast.success(result.message);
        form.reset(values);
        router.refresh();
      } else {
        toast.error(result.message);
        applyFieldErrors(form, result.fieldErrors);
        if (result.fieldErrors) focusErrorTab(Object.keys(result.fieldErrors));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {TABS.map((t) => <TabsTrigger key={t.value} value={t.value} className="flex-none">{t.label}</TabsTrigger>)}
          </TabsList>

          {/* Thông tin công ty */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin công ty</CardTitle>
                <CardDescription>Hiển thị ở header, footer, trang giới thiệu và dữ liệu Organization cho Google.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <TextField control={form.control} name="companyName" label="Tên công ty" required placeholder="Công ty TNHH ..." />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField control={form.control} name="shortName" label="Tên viết tắt" placeholder="Vd: NIJI" description="Hiện trên menu quản trị và nơi hẹp." />
                    <TextField control={form.control} name="foundedYear" label="Năm thành lập" inputMode="numeric" placeholder="2012" />
                  </div>
                  <TextField control={form.control} name="slogan" label="Slogan" placeholder="Vững bước tương lai – Vươn tầm quốc tế" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField control={form.control} name="licenseNumber" label="Số giấy phép XKLĐ" placeholder="Vd: 1234/LĐTBXH-GP" />
                    <TextField control={form.control} name="licenseIssuer" label="Cơ quan cấp phép" placeholder="Cục Quản lý lao động ngoài nước" />
                  </div>
                  <TextField control={form.control} name="taxCode" label="Mã số thuế" placeholder="0100000000" />
                </div>
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <ImageUploadField value={field.value} onChange={field.onChange} aspect="video" />
                      <FormDescription>Ảnh PNG/SVG nền trong, chiều cao tối thiểu 80px.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liên hệ */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Liên hệ</CardTitle>
                <CardDescription>Hotline và Zalo hiển thị ở nút liên hệ nổi trên mọi trang.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField control={form.control} name="hotline" label="Hotline" required type="tel" placeholder="0909 000 000" />
                  <TextField control={form.control} name="zalo" label="Số Zalo" type="tel" placeholder="0909000000" description="Để trống sẽ dùng hotline." />
                  <TextField control={form.control} name="email" label="Email liên hệ" type="email" placeholder="tuvan@congty.vn" />
                </div>
                <TextField control={form.control} name="address" label="Địa chỉ" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                <TextField control={form.control} name="workingHours" label="Giờ làm việc" placeholder="Thứ 2 – Thứ 7: 8:00 – 17:30" />
                <FormField
                  control={form.control}
                  name="mapEmbedUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link nhúng Google Maps</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          placeholder="https://www.google.com/maps/embed?pb=..."
                          onChange={(e) => {
                            // Cho phép dán cả mã <iframe>, hệ thống tự lấy phần src
                            const raw = e.target.value;
                            const match = raw.match(/src=["']([^"']+)["']/);
                            field.onChange(match ? match[1] : raw);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Cách lấy: mở Google Maps → tìm địa chỉ công ty → bấm <strong>Chia sẻ</strong> → tab <strong>Nhúng bản đồ</strong> → <strong>Sao chép HTML</strong>, rồi dán vào đây (có thể dán nguyên mã iframe, hệ thống tự tách link).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mapEmbedUrl && (
                  <iframe
                    src={mapEmbedUrl}
                    title="Xem trước bản đồ"
                    className="h-56 w-full rounded-lg border"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mạng xã hội */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Mạng xã hội</CardTitle>
                <CardDescription>Để trống mục nào thì icon mạng xã hội đó sẽ không hiển thị.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <TextField control={form.control} name="facebook" label="Facebook" type="url" placeholder="https://www.facebook.com/tencongty" />
                <TextField control={form.control} name="youtube" label="YouTube" type="url" placeholder="https://www.youtube.com/@tencongty" />
                <TextField control={form.control} name="tiktok" label="TikTok" type="url" placeholder="https://www.tiktok.com/@tencongty" />
                <TextField control={form.control} name="messenger" label="Messenger" type="url" placeholder="https://m.me/tencongty" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Số liệu */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Số liệu nổi bật</CardTitle>
                <CardDescription>Khối “Con số ấn tượng” ở trang chủ. Chỉ nhập số, để trống sẽ ẩn mục đó.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField control={form.control} name="statWorkers" label="Lao động đã xuất cảnh" inputMode="numeric" placeholder="8500" />
                <TextField control={form.control} name="statYears" label="Năm kinh nghiệm" inputMode="numeric" placeholder="14" />
                <TextField control={form.control} name="statPartners" label="Đối tác tiếp nhận" inputMode="numeric" placeholder="120" />
                <TextField control={form.control} name="statMarkets" label="Thị trường" inputMode="numeric" placeholder="6" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Giới thiệu */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu công ty</CardTitle>
                <CardDescription>Nội dung trang Giới thiệu và đoạn giới thiệu ngắn ở trang chủ.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextField control={form.control} name="aboutShort" label="Giới thiệu ngắn" multiline rows={4} placeholder="2–3 câu tóm tắt về công ty, hiển thị ở trang chủ" maxLength={1000} />
                <FormField
                  control={form.control}
                  name="aboutContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung trang Giới thiệu</FormLabel>
                      <RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight={320} placeholder="Lịch sử hình thành, năng lực, đội ngũ, cơ sở đào tạo..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField control={form.control} name="vision" label="Tầm nhìn" multiline rows={4} maxLength={1000} />
                  <TextField control={form.control} name="mission" label="Sứ mệnh" multiline rows={4} maxLength={1000} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO mặc định</CardTitle>
                <CardDescription>Dùng cho trang chủ và các trang chưa có tiêu đề/mô tả riêng.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                  <TextField control={form.control} name="metaTitle" label="Tiêu đề trang (meta title)" placeholder="Vd: NIJI – Xuất khẩu lao động Nhật Bản, Hàn Quốc, Đài Loan uy tín" maxLength={160} description="Khuyến nghị 50–60 ký tự." />
                  <TextField control={form.control} name="metaDescription" label="Mô tả trang (meta description)" multiline rows={3} maxLength={320} description="Khuyến nghị 150–160 ký tự." />
                </div>
                <FormField
                  control={form.control}
                  name="ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh chia sẻ mạng xã hội (OG image)</FormLabel>
                      <ImageUploadField value={field.value} onChange={field.onChange} aspect="video" />
                      <FormDescription>Kích thước 1200×630px.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t bg-background/95 py-3 backdrop-blur">
          <p className="text-xs text-muted-foreground">
            {form.formState.isDirty ? "Có thay đổi chưa lưu." : "Lưu sẽ làm mới toàn bộ website."}
          </p>
          <SubmitButton pending={isPending} className="min-w-32">Lưu cài đặt</SubmitButton>
        </div>
      </form>
    </Form>
  );
}
