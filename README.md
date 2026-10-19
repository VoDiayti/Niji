# Website công ty xuất khẩu lao động – bản Cloudflare

Website gồm **trang công khai** (giới thiệu, thị trường, đơn hàng tuyển dụng, du học – đào tạo, tin tức, liên hệ, FAQ, form đăng ký tư vấn) và **trang quản trị** `/admin` (bài viết, chuyên mục, thẻ, thị trường, đơn hàng, đăng ký tư vấn + xuất CSV, banner, cảm nhận, FAQ, đối tác, thư viện ảnh, cài đặt chung, tài khoản).

Toàn bộ hạ tầng chạy trên **Cloudflare**:

| Thành phần | Dịch vụ |
|---|---|
| Web (Next.js 16, App Router) | **Cloudflare Workers** qua [OpenNext](https://opennext.js.org/cloudflare) |
| Database | **Cloudflare D1** (SQLite) + Prisma 7 (`@prisma/adapter-d1`) |
| Ảnh upload | **Cloudflare R2** (binding `R2_BUCKET`), tùy chọn custom domain/`r2.dev` qua `R2_PUBLIC_URL` |
| Tối ưu ảnh `next/image` | Cloudflare Images (binding `IMAGES`) |
| Chống spam form | Workers Rate Limiting (binding `LEAD_RATE_LIMITER`) + honeypot |
| Đăng nhập admin | Auth.js v5, mật khẩu băm PBKDF2 (WebCrypto), vai trò Quản trị viên / Biên tập viên |

Quy ước code: [docs/DEV-GUIDE.md](docs/DEV-GUIDE.md). Mô tả yêu cầu gốc: [website-xuat-khau-lao-dong.md](website-xuat-khau-lao-dong.md).

## Yêu cầu

- Node.js 22 (≥ 20.19)
- Tài khoản Cloudflare (D1, R2, Workers). Chạy local **không cần** tài khoản: wrangler giả lập D1/R2 trong thư mục `.wrangler/state`.

## Chạy local

```bash
npm install                 # postinstall: prisma generate + wrangler types
cp .env.example .env        # sửa AUTH_SECRET (openssl rand -base64 32)
cp .dev.vars.example .dev.vars   # (nếu chưa có) rồi điền AUTH_SECRET giống .env

npm run db:migrate          # tạo bảng trong D1 local
npm run db:seed             # nạp dữ liệu mẫu + tài khoản admin
npm run dev                 # http://localhost:3000 (Next dev, có binding D1/R2 giả lập)
```

Tài khoản mẫu (đổi ngay sau khi đăng nhập tại **Admin → Tài khoản**):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@example.com` (đổi qua `SEED_ADMIN_EMAIL`) | `Admin@12345` (đổi qua `SEED_ADMIN_PASSWORD`) |
| Biên tập viên | `bientap@niji-xkld.vn` | `Editor@12345` |

Muốn chạy đúng runtime Workers (workerd) trên máy: `npm run preview` (build bằng OpenNext rồi chạy wrangler dev tại http://localhost:8787).

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Next dev server (có binding Cloudflare giả lập) |
| `npm run build` | `next build` (OpenNext tự gọi khi preview/deploy) |
| `npm run preview` | Build OpenNext + chạy trong workerd local |
| `npm run deploy` | Build OpenNext + deploy lên Cloudflare Workers |
| `npm run upload` | Build + upload phiên bản mới (không chuyển traffic) |
| `npm run cf-typegen` | Sinh `worker-configuration.d.ts` từ `wrangler.jsonc` (chạy lại sau khi sửa binding) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:generate` | Sinh Prisma Client |
| `npm run db:migration -- ten-thay-doi` | Sinh file SQL migration mới từ thay đổi trong `prisma/schema.prisma` |
| `npm run db:migrate` / `db:migrate:remote` | Áp dụng migration vào D1 local / production |
| `npm run db:seed` / `db:seed:remote` | Sinh `prisma/seed.sql` và nạp vào D1 local / production |
| `npm run db:shell -- "SELECT ..."` | Chạy SQL trên D1 local |

## Biến môi trường và bí mật

- **`.env`** (local, Next.js): `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `R2_PUBLIC_URL`, `PASSWORD_HASH_ITERATIONS`, `SEED_ADMIN_*`... Các giá trị `NEXT_PUBLIC_*` được nhúng lúc build.
- **`.dev.vars`** (local, runtime Workers khi `preview`): `NEXTJS_ENV=development`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`.
- **Production**: bí mật đặt bằng `npx wrangler secret put AUTH_SECRET`; biến thường đặt trong `vars` của `wrangler.jsonc` (vd `R2_PUBLIC_URL`) hoặc Dashboard. Khi deploy bằng `npm run deploy -- --keep-vars` thì giữ các biến đã đặt trên Dashboard.
- Xem danh sách đầy đủ trong [.env.example](.env.example).

## Thử nghiệm với D1 / R2 thật khi chưa nâng gói Workers Paid

Gói **Workers Free** giới hạn 3 MiB bundle nén nên `npm run deploy` sẽ bị từ chối (dự án ~4,2 MiB). D1 và R2 thì dùng được ngay ở gói Free, nên có thể chạy Worker **trên máy** nhưng đọc/ghi dữ liệu thật trên Cloudflare:

```bash
npx wrangler login
npm run db:migrate:remote        # tạo bảng trên D1 thật
npm run db:seed:remote           # dữ liệu mẫu + tài khoản admin
```

Rồi trong `wrangler.jsonc` đổi `"remote": false` → `"remote": true` ở binding `DB` (và `R2_BUCKET` nếu muốn upload vào bucket thật; khi đó điền `R2_PUBLIC_URL` thật vào `.dev.vars`). Chạy `npm run preview` (http://localhost:8787, đúng runtime workerd) hoặc `npm run dev`. Khi nâng lên Workers Paid thì tắt `remote` lại và `npm run deploy`.

## Triển khai lên Cloudflare (lần đầu)

```bash
npx wrangler login

# 1. Tạo database D1 và dán database_id vào wrangler.jsonc (mục d1_databases)
npx wrangler d1 create niji-xkld

# 2. Tạo bucket R2 chứa ảnh
npx wrangler r2 bucket create niji-xkld-media
#    (tùy chọn) bật Public access cho bucket hoặc gắn custom domain, rồi đặt R2_PUBLIC_URL trong wrangler.jsonc > vars

# 3. Bí mật
npx wrangler secret put AUTH_SECRET          # chuỗi ngẫu nhiên ≥ 32 ký tự

# 4. Tạo bảng + dữ liệu mẫu trên D1 production
npm run db:migrate:remote
npm run db:seed:remote                       # đổi SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD trong .env trước khi chạy

# 5. Đặt NEXT_PUBLIC_SITE_URL đúng tên miền (trong .env.production hoặc .env) rồi deploy
npm run deploy
```

Sau đó gắn tên miền cho Worker (Workers & Pages → Settings → Domains & Routes). Để `next/image` tối ưu ảnh trên production, bật **Images → Transformations** cho zone trong Dashboard.

### Deploy tự động từ Git

Kết nối repo GitHub/GitLab trong Cloudflare (Workers Builds): build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`. Đặt biến `NEXT_PUBLIC_SITE_URL` trong mục *Build variables*. Migration D1 vẫn chạy thủ công bằng `npm run db:migrate:remote` (hoặc thêm vào bước deploy).

### Cập nhật schema database

```bash
# sửa prisma/schema.prisma
npm run db:generate
npm run db:migration -- them-truong-x    # sinh migrations/000N_them_truong_x.sql (so với D1 local)
npm run db:migrate                       # áp dụng local
npm run db:migrate:remote                # áp dụng production
```

## Giới hạn cần biết

- **Kích thước Worker**: bundle (gồm Prisma query compiler WASM) vượt mức 3 MiB nén của gói Workers Free → cần **Workers Paid** (10 MiB). Xem con số thực tế bằng `npx wrangler deploy --dry-run --outdir=.wrangler/dry-run`.
- **CPU khi đăng nhập**: băm PBKDF2 100.000 vòng tốn vài chục ms CPU, vượt giới hạn 10 ms của gói Free. Gói Paid đủ dư; nếu buộc dùng Free hãy giảm `PASSWORD_HASH_ITERATIONS` (mật khẩu cũ vẫn kiểm tra được vì số vòng lưu kèm hash).
- **D1 không có transaction**: Prisma chạy từng câu lệnh riêng lẻ.
- **Không có ISR**: các trang công khai render động mỗi request (D1 nhanh, Worker chạy sát người dùng). Muốn cache thêm, dùng Cache Rules của Cloudflare hoặc bật incremental cache R2 theo tài liệu OpenNext.
- **Ảnh upload** được thu nhỏ (≤ 1920px) và chuyển WebP ngay trên trình duyệt trước khi gửi, vì Workers không chạy được thư viện xử lý ảnh.
- **Rate limiting** của Workers tính theo từng PoP, là biện pháp mềm; honeypot vẫn hoạt động.

## Sau khi cài đặt – việc cần làm

1. Admin → **Cài đặt chung**: tên công ty, số giấy phép, hotline/Zalo, email, địa chỉ, bản đồ, mạng xã hội, số liệu, giới thiệu, SEO (dữ liệu seed là mẫu).
2. **Tài khoản**: đổi mật khẩu admin, tạo tài khoản biên tập viên.
3. Thay nội dung/ảnh mẫu trong Banner, Thị trường, Đơn hàng, Bài viết, Cảm nhận, FAQ, Đối tác; thay `public/logo*.svg`, `public/og-default.jpg`, `src/app/icon.svg`.
4. Đặt `NEXT_PUBLIC_SITE_URL` và (nếu có) `R2_PUBLIC_URL` đúng tên miền trước khi deploy.
