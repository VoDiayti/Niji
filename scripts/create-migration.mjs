#!/usr/bin/env node
// Sinh file migration D1 từ thay đổi trong prisma/schema.prisma (so với DB local hiện tại):
//   npm run db:migration -- ten-thay-doi
// rồi áp dụng bằng `npm run db:migrate` (local) và `npm run db:migrate:remote` (production).
import { readdirSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const name = (process.argv[2] ?? "update").replace(/[^a-z0-9_]+/gi, "_").toLowerCase();
mkdirSync("migrations", { recursive: true });
const files = readdirSync("migrations").filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort();
const last = files.length ? parseInt(files[files.length - 1].slice(0, 4), 10) : 0;
const out = `migrations/${String(last + 1).padStart(4, "0")}_${name}.sql`;

const result = spawnSync(
  "npx",
  ["prisma", "migrate", "diff", "--from-local-d1", "--to-schema", "prisma/schema.prisma", "--script", "--output", out],
  { stdio: "inherit", shell: process.platform === "win32" }
);
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Đã tạo ${out}. Kiểm tra nội dung rồi chạy: npm run db:migrate (local) / npm run db:migrate:remote (production).`);
