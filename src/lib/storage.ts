import "server-only";
import { getCfEnv, getConfigVar } from "@/lib/cloudflare";

/**
 * Lưu trữ file trên Cloudflare R2 qua binding `R2_BUCKET` (wrangler.jsonc).
 * Khi `next dev`, wrangler giả lập R2 cục bộ trong thư mục .wrangler/state nên không cần tài khoản.
 */
export type StoredFile = { url: string; key: string };

/**
 * URL công khai của một key trong R2:
 * - có `R2_PUBLIC_URL` (custom domain hoặc URL r2.dev của bucket) → dùng trực tiếp, nhanh và không tốn CPU Worker
 * - không có → đi qua route /api/media/<key> của website (có cache dài hạn)
 */
export function publicUrlForKey(key: string): string {
  const base = (getConfigVar("R2_PUBLIC_URL") ?? "").replace(/\/$/, "");
  return base ? `${base}/${key}` : `/api/media/${key}`;
}

export async function putObject(
  key: string,
  body: ArrayBuffer | Uint8Array | ReadableStream | string,
  contentType: string,
  customMetadata?: Record<string, string>
): Promise<StoredFile> {
  await getCfEnv().R2_BUCKET.put(key, body, {
    httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata,
  });
  return { url: publicUrlForKey(key), key };
}

export async function getObject(key: string): Promise<R2ObjectBody | null> {
  const object = await getCfEnv().R2_BUCKET.get(key);
  return object && "body" in object ? (object as R2ObjectBody) : null;
}

export async function deleteObject(key: string): Promise<void> {
  await getCfEnv().R2_BUCKET.delete(key);
}
