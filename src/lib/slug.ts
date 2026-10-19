/** Tạo slug tiếng Việt không dấu: "Chi phí đi Nhật 2026" → "chi-phi-di-nhat-2026" */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Đảm bảo slug duy nhất: nếu đã tồn tại thì thêm hậu tố -2, -3...
 * `exists` là hàm kiểm tra slug đã có trong DB (bỏ qua bản ghi đang sửa nếu cần).
 */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  const root = slugify(base) || "bai-viet";
  let candidate = root;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${i++}`;
  }
  return candidate;
}
