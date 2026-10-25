import "server-only";
import { eq } from "drizzle-orm";
import { db, media } from "@/db";
import { deleteObject, putObject } from "@/lib/storage";
import { slugify } from "@/lib/slug";

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};
const MAX_MB = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 8);
export const MAX_UPLOAD_BYTES = MAX_MB * 1024 * 1024;

function randomSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Gỡ script và thuộc tính on* khỏi SVG để tránh XSS khi phục vụ file */
function sanitizeSvg(svg: string): string {
  return svg.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, "");
}

/**
 * Lưu một ảnh upload lên R2 và tạo bản ghi Media.
 * Ảnh được thu nhỏ/chuyển WebP ở phía trình duyệt trước khi gửi (xem src/lib/upload-client.ts);
 * server chỉ kiểm tra định dạng, dung lượng và lưu nguyên file.
 */
export async function storeImage(
  file: File,
  opts: { uploadedById?: string; alt?: string; width?: number | null; height?: number | null } = {}
) {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new UploadError("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF, AVIF hoặc SVG.");
  if (file.size === 0) throw new UploadError("File rỗng.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`Ảnh vượt quá dung lượng cho phép (${MAX_MB}MB).`);

  let body: ArrayBuffer | string = await file.arrayBuffer();
  if (file.type === "image/svg+xml") body = sanitizeSvg(new TextDecoder().decode(body));

  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "anh";
  const now = new Date();
  const key = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${base}-${randomSuffix()}.${ext}`;
  const alt = opts.alt?.trim() || base.replace(/-/g, " ");

  const stored = await putObject(key, body, file.type, { alt });
  const size = typeof body === "string" ? new TextEncoder().encode(body).byteLength : body.byteLength;

  const [row] = await db
    .insert(media)
    .values({
      url: stored.url,
      storageKey: stored.key,
      filename: file.name,
      mimeType: file.type,
      size,
      width: opts.width ?? null,
      height: opts.height ?? null,
      alt,
      uploadedById: opts.uploadedById ?? null,
    })
    .returning();
  return row;
}

/** Xóa ảnh khỏi R2 và database */
export async function deleteMedia(id: string) {
  const row = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!row) return;
  if (row.storageKey) {
    await deleteObject(row.storageKey).catch((err) => console.error("[storage] remove failed", err));
  }
  await db.delete(media).where(eq(media.id, id));
}
