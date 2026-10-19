"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { submitLead } from "@/actions/leads-public";
import { leadFormSchema, type LeadFormInput, type LeadFormValues } from "@/lib/validations/lead";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type LeadFormProps = {
  type: "CONSULTATION" | "APPLICATION" | "CONTACT";
  /** Cố định thị trường (trang chi tiết thị trường / đơn hàng) */
  marketId?: string;
  jobOrderId?: string;
  /** Danh sách thị trường để người dùng chọn khi không cố định */
  markets?: { id: string; name: string }[];
  variant?: "full" | "compact";
  title?: string;
  description?: string;
  submitLabel?: string;
  /** Hiển thị trên nền tối (chữ trắng) */
  tone?: "default" | "light";
  className?: string;
};

const NONE = "__none__";

/** Form đăng ký tư vấn / ứng tuyển / liên hệ dùng chung cho trang công khai */
export function LeadForm({
  type,
  marketId,
  jobOrderId,
  markets = [],
  variant = "full",
  title,
  description,
  submitLabel,
  tone = "default",
  className,
}: LeadFormProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultValues: LeadFormInput = {
    type,
    fullName: "",
    phone: "",
    email: "",
    birthYear: "",
    hometown: "",
    marketId: marketId ?? "",
    jobOrderId: jobOrderId ?? "",
    message: "",
    source: pathname,
    website: "",
  };

  const form = useForm<LeadFormInput, unknown, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues,
  });

  const isContact = type === "CONTACT";
  const showMarketSelect = !isContact && !marketId && markets.length > 0;
  const showProfileFields = !isContact;
  const showMessage = isContact || variant === "full";

  const onSubmit = (values: LeadFormValues) => {
    startTransition(async () => {
      const result = await submitLead({ ...values, type, source: pathname, jobOrderId: jobOrderId ?? values.jobOrderId, marketId: marketId ?? values.marketId });
      if (result.success) {
        const msg = result.message ?? "Đăng ký thành công!";
        toast.success(msg);
        setSuccessMessage(msg);
        form.reset(defaultValues);
        return;
      }
      toast.error(result.message);
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) form.setError(field as keyof LeadFormInput, { type: "server", message: messages[0] });
      }
    });
  };

  // compact: lưới 2 cột cố định (năm sinh + quê quán cùng hàng), các trường còn lại chiếm cả hàng
  const span2 = variant === "compact" ? "col-span-2" : "sm:col-span-2";
  const labelClass = cn("text-sm font-medium", tone === "light" && "text-white/90");
  const inputClass = cn("h-11 bg-background text-base md:h-10 md:text-sm", tone === "light" && "border-white/20 bg-white text-foreground");
  const heading = title ?? (isContact ? "Gửi liên hệ" : type === "APPLICATION" ? "Ứng tuyển đơn hàng này" : "Đăng ký tư vấn miễn phí");
  const button = submitLabel ?? (isContact ? "Gửi liên hệ" : type === "APPLICATION" ? "Gửi hồ sơ ứng tuyển" : "Đăng ký ngay");

  if (successMessage) {
    return (
      <div className={cn("rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center text-foreground sm:p-8", className)}>
        <CircleCheck className="mx-auto size-14 text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold text-emerald-800">{isContact ? "Đã gửi liên hệ thành công" : "Đăng ký thành công"}</h3>
        <p className="mt-2 text-muted-foreground">{successMessage}</p>
        <Button type="button" variant="outline" className="mt-6 h-11" onClick={() => setSuccessMessage(null)}>
          {isContact ? "Gửi liên hệ khác" : "Gửi đăng ký khác"}
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {(heading || description) && (
        <div className="mb-5">
          <h3 className={cn("text-xl font-bold md:text-2xl", tone === "light" ? "text-white" : "text-brand-dark")}>{heading}</h3>
          {description && <p className={cn("mt-1.5 text-sm", tone === "light" ? "text-white/80" : "text-muted-foreground")}>{description}</p>}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Honeypot chống spam – người dùng thật không thấy trường này */}
          <input type="text" {...form.register("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

          <div className={cn("grid gap-4", variant === "full" ? "sm:grid-cols-2" : "grid-cols-2")}>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className={variant === "compact" ? "col-span-2" : undefined}>
                  <FormLabel className={labelClass}>
                    Họ và tên <span className="text-cta">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nguyễn Văn A" autoComplete="name" className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className={variant === "compact" ? "col-span-2" : undefined}>
                  <FormLabel className={labelClass}>
                    Số điện thoại <span className="text-cta">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" inputMode="tel" placeholder="09xx xxx xxx" autoComplete="tel" className={inputClass} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isContact && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className={span2}>
                    <FormLabel className={labelClass}>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" inputMode="email" placeholder="email@example.com" autoComplete="email" className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showProfileFields && (
              <>
                <FormField
                  control={form.control}
                  name="birthYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Năm sinh</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="numeric" placeholder="VD: 1998" maxLength={4} className={inputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hometown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Quê quán (tỉnh/thành)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: Nghệ An" autoComplete="address-level1" className={inputClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {showMarketSelect && (
              <FormField
                control={form.control}
                name="marketId"
                render={({ field }) => (
                  <FormItem className={span2}>
                    <FormLabel className={labelClass}>Thị trường quan tâm</FormLabel>
                    <Select value={field.value || NONE} onValueChange={(v) => field.onChange(v === NONE ? "" : v)}>
                      <FormControl>
                        <SelectTrigger className={cn("w-full data-[size=default]:h-11 md:data-[size=default]:h-10", inputClass)}>
                          <SelectValue placeholder="Chọn thị trường" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Chưa xác định – cần tư vấn</SelectItem>
                        {markets.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {showMessage && (
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className={span2}>
                    <FormLabel className={labelClass}>{isContact ? "Nội dung" : "Ghi chú"}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={isContact ? 5 : 3}
                        placeholder={isContact ? "Bạn cần chúng tôi hỗ trợ điều gì?" : "Kinh nghiệm, ngành nghề mong muốn, câu hỏi cần tư vấn..."}
                        className={cn("min-h-24 text-base md:text-sm", tone === "light" && "border-white/20 bg-white text-foreground")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Button type="submit" disabled={isPending} size="lg" className="h-12 w-full bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
            {isPending ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
            {isPending ? "Đang gửi..." : button}
          </Button>
          <p className={cn("text-center text-xs", tone === "light" ? "text-white/70" : "text-muted-foreground")}>
            Thông tin của bạn được bảo mật và chỉ dùng để tư vấn. Hoàn toàn miễn phí.
          </p>
        </form>
      </Form>
    </div>
  );
}
