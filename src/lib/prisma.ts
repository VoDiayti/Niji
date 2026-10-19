import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { getCfEnv } from "@/lib/cloudflare";

/**
 * Prisma Client cho Cloudflare D1.
 * D1 chỉ truy cập được qua binding trong ngữ cảnh request, nên client được tạo "lười" khi dùng lần đầu
 * và được giữ lại theo từng binding (mỗi isolate Worker có một binding) để không tạo client mới cho mỗi request.
 */
const clients = new WeakMap<D1Database, PrismaClient>();

function getClient(): PrismaClient {
  const db = getCfEnv().DB;
  let client = clients.get(db);
  if (!client) {
    client = new PrismaClient({
      adapter: new PrismaD1(db),
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
    clients.set(db, client);
  }
  return client;
}

/**
 * `prisma` dùng như bình thường (`prisma.post.findMany()`...). Proxy chuyển mọi truy cập tới client thật.
 * Lưu ý D1 không hỗ trợ transaction: `$transaction` sẽ chạy tuần tự từng câu lệnh.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value;
  },
});
