"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type TextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  description?: React.ReactNode;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  /** Gợi ý giá trị (id của <datalist>) */
  list?: string;
};

/** Trường văn bản (Input/Textarea) chuẩn cho form admin – dùng cho các field kiểu chuỗi */
export function TextField<T extends FieldValues>({
  control, name, label, placeholder, description, required, type = "text", inputMode, multiline, rows = 3, maxLength, className, list,
}: TextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string | null | undefined) ?? "";
        return (
          <FormItem className={className}>
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
            <FormControl>
              {multiline ? (
                <Textarea {...field} value={value} rows={rows} placeholder={placeholder} maxLength={maxLength} />
              ) : (
                <Input {...field} value={value} type={type} inputMode={inputMode} placeholder={placeholder} maxLength={maxLength} list={list} />
              )}
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
