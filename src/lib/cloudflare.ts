import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Lấy các binding Cloudflare (D1 `DB`, R2 `R2_BUCKET`, `LEAD_RATE_LIMITER`, biến môi trường...).
 * Chỉ gọi trong lúc xử lý request: server component động, route handler, server action, proxy.
 * Kiểu `CloudflareEnv` được sinh từ wrangler.jsonc bằng `npm run cf-typegen`.
 */
export function getCfEnv(): CloudflareEnv {
  return getCloudflareContext().env;
}

/** Phiên bản async – dùng được cả khi render tĩnh lúc build (SSG). */
export async function getCfEnvAsync(): Promise<CloudflareEnv> {
  return (await getCloudflareContext({ async: true })).env;
}

/** Đọc biến cấu hình dạng chuỗi: ưu tiên process.env (.env khi dev), sau đó tới `vars`/secrets của Worker. */
export function getConfigVar(name: keyof CloudflareEnv & string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;
  try {
    const value = getCfEnv()[name];
    return typeof value === "string" && value ? value : undefined;
  } catch {
    return undefined;
  }
}
