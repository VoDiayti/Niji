import "server-only";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { getCfEnv } from "@/lib/cloudflare";
import * as schema from "./schema";

export type Database = DrizzleD1Database<typeof schema>;

/** Mỗi binding D1 (mỗi isolate Worker) giữ một instance Drizzle – tạo rất rẻ nhưng không cần tạo lại mỗi request. */
const cache = new WeakMap<D1Database, Database>();

export function getDb(): Database {
  const d1 = getCfEnv().DB;
  let db = cache.get(d1);
  if (!db) {
    db = drizzle(d1, { schema });
    cache.set(d1, db);
  }
  return db;
}

/**
 * `db` dùng như Drizzle bình thường: `db.select()`, `db.query.posts.findMany()`, `db.insert(posts)...`, `db.batch([...])`.
 * Proxy "lười" chuyển mọi truy cập tới instance thật của request hiện tại (chỉ dùng trong lúc xử lý request).
 */
export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});

export * from "./schema";
export * from "./types";
