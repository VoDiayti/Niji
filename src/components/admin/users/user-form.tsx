"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Role } from "@/generated/prisma/enums";
import { ROLE_LABELS } from "@/lib/constants";
import { createUserSchema, updateUserSchema, USER_ROLES, type CreateUserValues, type UpdateUserValues } from "@/lib/validations/user";
import { createUser, updateUser } from "@/actions/users";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/admin/submit-button";
import { TextField } from "@/components/admin/banners/text-field";
import { applyFieldErrors } from "@/components/admin/banners/form-utils";

const LIST_PATH = "/admin/tai-khoan";

const ROLE_HINT: Record<Role, string> = {
  ADMIN: "Toàn quyền, kể cả quản lý tài khoản và cài đặt.",
  EDITOR: "Quản lý nội dung (bài viết, đơn hàng, đăng ký...), không quản lý tài khoản.",
};

/** Form tạo tài khoản mới (chỉ Quản trị viên) */
export function CreateUserForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "EDITOR" },
  });

  const onSubmit = (values: CreateUserValues) => {
    startTransition(async () => {
      const result = await createUser(values);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Người dùng đăng nhập bằng email và mật khẩu dưới đây; có thể tự đổi mật khẩu sau.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField control={form.control} name="name" label="Họ tên" required placeholder="Vd: Nguyễn Thị Hương" />
            <TextField control={form.control} name="email" label="Email đăng nhập" required type="email" placeholder="ten@congty.vn" />
            <TextField control={form.control} name="password" label="Mật khẩu" required type="password" placeholder="Tối thiểu 8 ký tự" description="Nên gồm chữ, số và ký tự đặc biệt." />
            <RoleSelectField control={form.control} name="role" />
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild><Link href={LIST_PATH}>Hủy</Link></Button>
          <SubmitButton pending={isPending}>Tạo tài khoản</SubmitButton>
        </div>
      </form>
    </Form>
  );
}

type EditableUser = { id: string; name: string; email: string; role: Role; isActive: boolean };

/** Form sửa tài khoản: tên, vai trò, khóa/mở, đặt lại mật khẩu (tùy chọn) */
export function EditUserForm({ user, isSelf }: { user: EditableUser; isSelf: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user.name, role: user.role, isActive: user.isActive, password: "" },
  });

  const onSubmit = (values: UpdateUserValues) => {
    startTransition(async () => {
      const result = await updateUser(user.id, values);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Email đăng nhập: <span className="font-medium text-foreground">{user.email}</span> (không đổi được).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField control={form.control} name="name" label="Họ tên" required />
            <RoleSelectField control={form.control} name="role" disabled={isSelf} description={isSelf ? "Bạn không thể tự thay đổi vai trò của mình." : undefined} />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Tài khoản hoạt động</FormLabel>
                    <FormDescription>{isSelf ? "Bạn không thể tự khóa tài khoản của mình." : "Tắt để khóa – người dùng sẽ không đăng nhập được."}</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSelf} /></FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>Để trống nếu không muốn đổi. {isSelf && "Để đổi mật khẩu của chính mình, hãy dùng trang “Đổi mật khẩu”."}</CardDescription>
          </CardHeader>
          <CardContent>
            <TextField control={form.control} name="password" label="Mật khẩu mới" type="password" placeholder="Tối thiểu 8 ký tự" />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild><Link href={LIST_PATH}>Hủy</Link></Button>
          <SubmitButton pending={isPending}>Lưu thay đổi</SubmitButton>
        </div>
      </form>
    </Form>
  );
}

function RoleSelectField<T extends FieldValues>({
  control, name, disabled, description,
}: { control: Control<T>; name: FieldPath<T>; disabled?: boolean; description?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as Role | undefined) ?? "EDITOR";
        return (
          <FormItem>
            <FormLabel>Vai trò</FormLabel>
            <Select value={value} onValueChange={field.onChange} disabled={disabled}>
              <FormControl>
                <SelectTrigger className="w-full"><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {USER_ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormDescription>{description ?? ROLE_HINT[value]}</FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
