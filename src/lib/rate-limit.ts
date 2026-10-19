import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Chống spam form công khai.
 * - Trên Cloudflare: dùng binding Rate Limiting `LEAD_RATE_LIMITER` (cấu hình trong wrangler.jsonc, tính theo từng PoP).
 * - Khi không có binding (vd. `next dev` chưa cấu hình): dùng bộ đếm trong bộ nhớ.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
const MEMORY_MAX = Number(process.env.RATE_LIMIT_MAX ?? 5);
const MEMORY_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 600) * 1000;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  try {
    const limiter = getCloudflareContext().env.LEAD_RATE_LIMITER;
    if (limiter) {
      const { success } = await limiter.limit({ key });
      return { allowed: success, retryAfterSeconds: success ? 0 : 60 };
    }
  } catch {
    // ngoài ngữ cảnh request hoặc binding chưa được cấu hình → dùng bộ nhớ
  }
  return checkInMemory(key);
}

function checkInMemory(key: string): RateLimitResult {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + MEMORY_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.count >= MEMORY_MAX) return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** IP client: Cloudflare đặt trong `cf-connecting-ip`; dự phòng x-forwarded-for khi chạy sau proxy khác. */
export function getClientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
