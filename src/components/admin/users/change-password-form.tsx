"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations/user";
import { changeOwnPassword } from "@/actions/users";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/admin/submit-button";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

/** Form đổi mật khẩu của chính người đang đăng nhập (mọi vai trò) */
export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = (values: ChangePasswordValues) => {
    startTransition(async () => {
      const result = await changeOwnPassword(values);
      if (result.success) {
        toast.success(result.message);
        form.reset();
      } else {
        toast.error(result.message);
        applyFieldErrors(form, result.fieldErrors);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-md space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>Mật khẩu mới tối thiểu 8 ký tự. Sau khi đổi, các phiên đăng nhập hiện tại vẫn giữ nguyên.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField control={form.control} name="currentPassword" label="Mật khẩu hiện tại" required type="password" />
            <TextField control={form.control} name="newPassword" label="Mật khẩu mới" required type="password" placeholder="Tối thiểu 8 ký tự" />
            <TextField control={form.control} name="confirmPassword" label="Nhập lại mật khẩu mới" required type="password" />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <SubmitButton pending={isPending}>Đổi mật khẩu</SubmitButton>
        </div>
      </form>
    </Form>
  );
}
