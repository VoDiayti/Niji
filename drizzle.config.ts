import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit chỉ dùng để SINH SQL migration từ src/db/schema.ts (không kết nối DB).
 * Thư mục `drizzle/` chứa snapshot + SQL do drizzle-kit sinh; file SQL thực sự được áp dụng nằm trong `migrations/`
 * (script scripts/create-migration.mjs sao chép sang đó với số thứ tự của wrangler).
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  strict: true,
});
