import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Lấy AUTH_SECRET tại thời điểm xử lý request.
 * Trên Cloudflare Workers, secret (đặt bằng `wrangler secret put AUTH_SECRET`) chỉ có trong `env` của request,
 * nên Auth.js phải được cấu hình "lười" (NextAuth(async () => config)) thay vì đọc process.env lúc nạp module.
 */
export async function getAuthSecret(): Promise<string | undefined> {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  try {
    const { env } = await getCloudflareContext({ async: true });
    const value = (env as unknown as Record<string, unknown>).AUTH_SECRET;
    return typeof value === "string" && value ? value : undefined;
  } catch {
    return undefined;
  }
}
