// Cấu hình Prisma 7. Database thật là Cloudflare D1 (truy cập qua binding trong code),
// nên URL bên dưới chỉ là giá trị hình thức để Prisma CLI (generate / migrate diff) chạy được.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./prisma/local-placeholder.db",
  },
});
