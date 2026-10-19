"use client";

import { useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { createPost, updatePost } from "@/actions/posts";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { POST_STATUS_LABELS } from "@/lib/constants";
import { NONE_VALUE, POST_STATUS_VALUES, postSchema, type PostFormValues } from "@/lib/validations/post";
import type { PostStatus } from "@/generated/prisma/enums";
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

export type PostFormOption = { id: string; name: string };

/** Dữ liệu bài viết hiện có (đã serialize) để điền vào form sửa */
export type PostFormInitialData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: PostStatus;
  /** ISO string */
  publishedAt: string | null;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  categoryId: string | null;
  tagIds: string[];
  authorName: string | null;
  /** ISO string */
  updatedAt: string;
};

type PostFormProps = {
  initialData?: PostFormInitialData;
  categories: PostFormOption[];
  tags: PostFormOption[];
  /** Tên người đang đăng nhập – hiển thị là tác giả khi tạo bài mới */
  currentUserName?: string | null;
};

/** ISO → giá trị cho input datetime-local theo giờ máy người dùng ("2026-10-12T09:30") */
function toLocalDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDefaults(data?: PostFormInitialData): PostFormValues {
  return {
    title: data?.title ?? "",
    slug: data?.slug ?? "",
    excerpt: data?.excerpt ?? "",
    content: data?.content ?? "",
    coverImage: data?.coverImage ?? "",
    categoryId: data?.categoryId ?? NONE_VALUE,
    tagIds: data?.tagIds ?? [],
    newTags: "",
    status: data?.status ?? "DRAFT",
    // Điền sau khi mount (xem useEffect trong PostForm) vì giá trị phụ thuộc múi giờ trình duyệt
    publishedAt: "",
    isFeatured: data?.isFeatured ?? false,
    metaTitle: data?.metaTitle ?? "",
    metaDescription: data?.metaDescription ?? "",
    ogImage: data?.ogImage ?? "",
  };
}

const PUBLISHED_AT_LABEL: Record<PostStatus, string> = {
  DRAFT: "Thời gian xuất bản (tùy chọn)",
  PUBLISHED: "Thời gian xuất bản",
  SCHEDULED: "Thời gian hẹn giờ đăng",
};
const PUBLISHED_AT_HINT: Record<PostStatus, string> = {
  DRAFT: "Bài nháp không hiển thị trên website.",
  PUBLISHED: "Để trống để lấy thời điểm bấm Lưu.",
  SCHEDULED: "Bài sẽ tự hiển thị trên website khi đến thời điểm này.",
};

/** Form tạo / sửa bài viết – 2 cột trên desktop (nội dung | cài đặt), 1 cột trên mobile */
export function PostForm({ initialData, categories, tags, currentUserName }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // Đã sửa slug bằng tay (hoặc đang sửa bài cũ) → không tự sinh lại từ tiêu đề
  const slugTouched = useRef(Boolean(initialData));

  const form = useForm<PostFormValues>({ resolver: zodResolver(postSchema), defaultValues: toDefaults(initialData) });
  const initialPublishedAt = initialData?.publishedAt ?? null;
  // datetime-local hiển thị theo giờ trình duyệt → chỉ điền sau khi mount để SSR và client luôn khớp nhau
  useEffect(() => {
    form.setValue("publishedAt", toLocalDateTimeInput(initialPublishedAt));
  }, [form, initialPublishedAt]);
  const status = useWatch({ control: form.control, name: "status" });
  const excerpt = useWatch({ control: form.control, name: "excerpt" });
  const metaTitle = useWatch({ control: form.control, name: "metaTitle" });
  const metaDescription = useWatch({ control: form.control, name: "metaDescription" });

  const applyFieldErrors = (fieldErrors?: Record<string, string[]>) => {
    if (!fieldErrors) return;
    const names = Object.keys(form.getValues());
    for (const [name, messages] of Object.entries(fieldErrors)) {
      if (names.includes(name) && messages[0]) form.setError(name as keyof PostFormValues, { message: messages[0] });
    }
  };

  const onSubmit = (values: PostFormValues) => {
    // Gửi thời gian dạng ISO để server không phụ thuộc múi giờ
    const payload: PostFormValues = { ...values, publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : "" };
    startTransition(async () => {
      const result = initialData ? await updatePost(initialData.id, payload) : await createPost(payload);
      if (!result.success) {
        toast.error(result.message);
        applyFieldErrors(result.fieldErrors);
        return;
      }
      toast.success(result.message ?? "Đã lưu bài viết");
      if (!initialData) {
        router.push(result.data ? `/admin/bai-viet/${result.data.id}` : "/admin/bai-viet");
        return;
      }
      if (result.data) {
        form.setValue("slug", result.data.slug);
        form.setValue("tagIds", result.data.tagIds);
        form.setValue("newTags", "");
      }
      router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cột trái – nội dung chính */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Nội dung bài viết</CardTitle></CardHeader>
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
                          placeholder="Nhập tiêu đề bài viết"
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
                        <span className="hidden items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground sm:flex">/tin-tuc/</span>
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
                      <FormDescription>Tự sinh từ tiêu đề khi để trống. Nếu trùng với bài khác, hệ thống tự thêm hậu tố.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Tóm tắt 1–2 câu hiển thị ở danh sách tin và khi chia sẻ" />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Hiển thị ở danh sách tin tức.</span>
                        <span className={cn(excerpt.length > 500 && "text-destructive")}>{excerpt.length}/500</span>
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
                      <FormLabel>Nội dung</FormLabel>
                      <RichTextEditor value={field.value} onChange={field.onChange} minHeight={440} placeholder="Soạn nội dung bài viết..." />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Cột phải – cài đặt */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Xuất bản</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {POST_STATUS_VALUES.map((s) => (
                            <SelectItem key={s} value={s}>{POST_STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {PUBLISHED_AT_LABEL[status]} {status === "SCHEDULED" && <span className="text-destructive">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input type="datetime-local" step={60} {...field} />
                      </FormControl>
                      <FormDescription>{PUBLISHED_AT_HINT[status]}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between gap-3 rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Bài viết nổi bật</FormLabel>
                        <FormDescription>Ưu tiên hiển thị ở trang chủ và đầu trang tin tức.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Đánh dấu nổi bật" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-1 border-t pt-3 text-sm text-muted-foreground">
                  <p>
                    Tác giả: <span className="font-medium text-foreground">{initialData ? (initialData.authorName ?? "—") : (currentUserName ?? "Tài khoản đang đăng nhập")}</span>
                  </p>
                  {initialData && <p>Cập nhật lần cuối: {formatDateTime(initialData.updatedAt)}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Phân loại</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chuyên mục</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full"><SelectValue placeholder="Chọn chuyên mục" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>Chưa phân loại</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thẻ</FormLabel>
                      {tags.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có thẻ nào – nhập thẻ mới ở ô bên dưới.</p>
                      ) : (
                        <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-md border p-2" role="group" aria-label="Chọn thẻ">
                          {tags.map((t) => {
                            const active = field.value.includes(t.id);
                            return (
                              <button
                                key={t.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => field.onChange(active ? field.value.filter((id) => id !== t.id) : [...field.value, t.id])}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                  active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-accent"
                                )}
                              >
                                {active && <Check className="size-3" />}
                                {t.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <FormDescription>Đã chọn {field.value.length} thẻ.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thêm thẻ mới</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Vd: Nhật Bản, Visa, Chi phí" />
                      </FormControl>
                      <FormDescription>Cách nhau bằng dấu phẩy; thẻ chưa có sẽ được tạo khi lưu.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ảnh đại diện</CardTitle></CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <ImageFieldWithLibrary value={field.value || null} onChange={(url) => field.onChange(url ?? "")} aspect="video" />
                      <FormDescription>Tỷ lệ 16:9, tối thiểu 1200×675 px cho đẹp.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề SEO</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Để trống để dùng tiêu đề bài viết" />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Khuyến nghị tối đa 60 ký tự.</span>
                        <span className={cn(metaTitle.length > 60 && "text-amber-600")}>{metaTitle.length}/60</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả SEO</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Để trống để dùng mô tả ngắn" />
                      </FormControl>
                      <FormDescription className="flex justify-between">
                        <span>Khuyến nghị tối đa 160 ký tự.</span>
                        <span className={cn(metaDescription.length > 160 && "text-amber-600")}>{metaDescription.length}/160</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ogImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ảnh chia sẻ (Open Graph)</FormLabel>
                      <ImageFieldWithLibrary value={field.value || null} onChange={(url) => field.onChange(url ?? "")} aspect="video" />
                      <FormDescription>Hiển thị khi chia sẻ lên Facebook/Zalo. Để trống để dùng ảnh đại diện.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Thanh hành động cố định dưới cùng */}
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <Button type="button" variant="ghost" asChild>
            <Link href="/admin/bai-viet"><ArrowLeft /> Danh sách bài viết</Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {initialData && (
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/bai-viet/${initialData.id}/xem-truoc`} target="_blank" title="Xem bản đã lưu gần nhất">
                  <Eye /> Xem trước
                </Link>
              </Button>
            )}
            <SubmitButton pending={isPending} pendingText="Đang lưu..." className="min-w-28">
              Lưu
            </SubmitButton>
          </div>
        </div>
      </form>
    </Form>
  );
}
