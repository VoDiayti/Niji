/**
 * Upload ảnh từ trình duyệt (gọi API /api/admin/upload).
 * Vì Cloudflare Workers không chạy được thư viện xử lý ảnh, ảnh được thu nhỏ (tối đa 1920px)
 * và chuyển sang WebP ngay trên trình duyệt trước khi gửi lên. GIF/SVG giữ nguyên.
 */
export type UploadedImage = { id: string; url: string; width?: number | null; height?: number | null; alt: string; filename: string };

const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.85;

async function resizeForUpload(file: File): Promise<{ file: File; width?: number; height?: number }> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type) || typeof createImageBitmap !== "function") return { file };
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, width: bitmap.width, height: bitmap.height };
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
    if (!blob) return { file, width, height };
    const name = `${file.name.replace(/\.[^.]+$/, "")}.webp`;
    return { file: new File([blob], name, { type: "image/webp" }), width, height };
  } catch {
    return { file };
  }
}

export async function uploadImage(file: File, alt?: string): Promise<UploadedImage> {
  const prepared = await resizeForUpload(file);
  const formData = new FormData();
  formData.append("file", prepared.file);
  if (alt) formData.append("alt", alt);
  if (prepared.width) formData.append("width", String(prepared.width));
  if (prepared.height) formData.append("height", String(prepared.height));
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const json = (await res.json().catch(() => ({}))) as Partial<UploadedImage> & { error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload ảnh thất bại");
  return json as UploadedImage;
}
