import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Host ảnh ngoài được phép dùng với next/image: bucket R2 công khai (R2_PUBLIC_URL) + IMAGE_REMOTE_HOSTS=a.com,b.com
function hostOf(url?: string): string | undefined {
  try {
    return url ? new URL(url).hostname : undefined;
  } catch {
    return undefined;
  }
}
const remoteHosts = [hostOf(process.env.R2_PUBLIC_URL), ...(process.env.IMAGE_REMOTE_HOSTS ?? "").split(",").map((h) => h.trim())]
  .filter((h): h is string => Boolean(h))
  .map((hostname) => ({ protocol: "https" as const, hostname }));

const nextConfig: NextConfig = {
  // Không đưa các gói có file .wasm không dùng vào bản build cho Worker (Turbopack quét mọi .wasm trong gói được trace,
  // mỗi file làm Worker phình thêm hàng trăm KiB). Thêm gói mới có .wasm thì cân nhắc loại trừ tương tự.
  outputFileTracingExcludes: {
    "*": [
      "./node_modules/@electric-sql/**",
      "./node_modules/blake3-wasm/**",
      "./node_modules/next/dist/compiled/@vercel/og/**",
    ],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }, { protocol: "https", hostname: "**.r2.dev" }, ...remoteHosts],
    qualities: [60, 75, 90],
  },
};

export default nextConfig;

// Cho phép dùng binding Cloudflare (D1, R2, rate limiter...) ngay khi chạy `next dev`
initOpenNextCloudflareForDev();
