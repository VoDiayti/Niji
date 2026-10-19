import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

/** Gán lỗi theo trường (từ `ActionResult.fieldErrors` của server) vào react-hook-form */
export function applyFieldErrors<TInput extends FieldValues>(
  form: { setError: UseFormSetError<TInput> },
  fieldErrors?: Record<string, string[]>
) {
  if (!fieldErrors) return;
  for (const [name, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0];
    if (message) form.setError(name as Path<TInput>, { type: "server", message });
  }
}
