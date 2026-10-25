#!/usr/bin/env node
// Sinh file migration D1 từ thay đổi trong src/db/schema.ts:
//   npm run db:migration -- ten-thay-doi
// 1. drizzle-kit so sánh schema với snapshot gần nhất trong drizzle/meta và sinh drizzle/NNNN_ten.sql
// 2. file SQL đó được sao chép sang migrations/000N_ten.sql (thứ tự của wrangler)
// Sau đó: npm run db:migrate (local) / npm run db:migrate:remote (production).
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const name = (process.argv[2] ?? "update").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
mkdirSync("migrations", { recursive: true });

const before = new Set(readdirSync("drizzle").filter((f) => f.endsWith(".sql")));
const result = spawnSync("npx", ["drizzle-kit", "generate", "--name", name], { stdio: "inherit", shell: process.platform === "win32" });
if (result.status !== 0) process.exit(result.status ?? 1);

const created = readdirSync("drizzle").filter((f) => f.endsWith(".sql") && !before.has(f));
if (created.length === 0) {
  console.log("Không có thay đổi schema nào cần migration.");
  process.exit(0);
}
const source = `drizzle/${created[0]}`;
const sql = readFileSync(source, "utf8").trim();
if (!sql) {
  console.log("Migration rỗng, bỏ qua.");
  process.exit(0);
}
const files = readdirSync("migrations").filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
const last = files.length ? parseInt(files[files.length - 1].slice(0, 4), 10) : 0;
const target = `migrations/${String(last + 1).padStart(4, "0")}_${name}.sql`;
if (existsSync(target)) {
  console.error(`File ${target} đã tồn tại.`);
  process.exit(1);
}
copyFileSync(source, target);
console.log(`Đã tạo ${target} (từ ${source}). Kiểm tra nội dung rồi chạy: npm run db:migrate (local) / npm run db:migrate:remote (production).`);
