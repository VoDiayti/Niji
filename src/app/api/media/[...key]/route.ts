import { getObject } from "@/lib/storage";

/**
 * GET /api/media/<key> – phục vụ file từ R2 qua website.
 * Dùng khi chưa cấu hình R2_PUBLIC_URL (custom domain / r2.dev) và khi chạy `next dev` với R2 giả lập.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const objectKey = key.map((part) => decodeURIComponent(part)).join("/");
  if (!objectKey || objectKey.includes("..")) return new Response("Not found", { status: 404 });

  const object = await getObject(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
