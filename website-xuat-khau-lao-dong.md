# Prompt: Website công ty xuất khẩu lao động

> Copy toàn bộ phần bên dưới và dán vào công cụ AI lập trình (Claude Code, Cursor, v0, Bolt...). Thay các chỗ trong `[ngoặc vuông]` bằng thông tin thật của công ty.

---

Bạn là một lập trình viên full-stack giàu kinh nghiệm. Hãy xây dựng hoàn chỉnh một website cho **công ty xuất khẩu lao động [TÊN CÔNG TY]**, gồm **trang hiển thị cho người dùng (frontend)** và **trang quản trị (admin/backend)** để quản lý bài viết và nội dung liên quan.

## 1. Công nghệ sử dụng

- **Framework:** Next.js (App Router) + TypeScript
- **Giao diện:** Tailwind CSS, có thể dùng thêm shadcn/ui cho các component
- **Cơ sở dữ liệu:** PostgreSQL, truy cập qua Prisma ORM
- **Xác thực admin:** NextAuth (Auth.js) với đăng nhập email + mật khẩu, mật khẩu băm bằng bcrypt
- **Soạn thảo bài viết:** Trình soạn thảo rich text (TipTap hoặc tương đương) hỗ trợ tiêu đề, in đậm, danh sách, chèn ảnh, chèn video YouTube, bảng, liên kết
- **Lưu ảnh:** Upload ảnh lên thư mục local trong môi trường dev, cấu hình được sang dịch vụ lưu trữ (S3/Cloudinary) qua biến môi trường
- **Form & validate:** React Hook Form + Zod
- Toàn bộ giao diện bằng **tiếng Việt**, responsive tốt trên điện thoại (phần lớn người lao động truy cập bằng di động)

## 2. Frontend (trang công khai)

### Các trang cần có
1. **Trang chủ**
   - Banner lớn có slogan và nút kêu gọi hành động ("Đăng ký tư vấn", "Xem đơn hàng")
   - Giới thiệu ngắn về công ty, số giấy phép hoạt động XKLĐ
   - Các thị trường nổi bật (Nhật Bản, Hàn Quốc, Đài Loan, Đức, châu Âu...)
   - Đơn hàng tuyển dụng mới nhất
   - Con số ấn tượng (số lao động đã xuất cảnh, số năm hoạt động, đối tác...)
   - Quy trình xuất khẩu lao động theo từng bước
   - Cảm nhận của học viên/người lao động (testimonial)
   - Tin tức mới nhất
   - Form đăng ký tư vấn nhanh
2. **Giới thiệu:** lịch sử, tầm nhìn sứ mệnh, giấy phép, đội ngũ, cơ sở đào tạo, hình ảnh hoạt động
3. **Thị trường:** trang danh sách và trang chi tiết từng thị trường (điều kiện, mức lương, chi phí, thời gian, ngành nghề phổ biến)
4. **Đơn hàng tuyển dụng:** danh sách có lọc theo thị trường, ngành nghề, giới tính, độ tuổi, mức lương; trang chi tiết đơn hàng có nút "Ứng tuyển ngay"
5. **Du học / Đào tạo** (tùy chọn): các chương trình du học nghề, khóa đào tạo tiếng
6. **Tin tức:** danh sách bài viết theo chuyên mục, tìm kiếm, phân trang; trang chi tiết bài viết có bài liên quan và nút chia sẻ (Facebook, Zalo)
7. **Liên hệ:** địa chỉ, bản đồ Google Maps, hotline, email, form liên hệ
8. **Câu hỏi thường gặp (FAQ)**

### Thành phần chung
- Header có menu, hotline nổi bật; footer có thông tin công ty, giấy phép, mạng xã hội
- Nút liên hệ nổi cố định: gọi điện, Zalo, Messenger
- Form ứng tuyển/đăng ký tư vấn: họ tên, số điện thoại, năm sinh, quê quán, thị trường quan tâm, ghi chú. Dữ liệu lưu vào database và hiện trong admin

### SEO & hiệu năng
- Mỗi trang có meta title, description, Open Graph image
- URL thân thiện dạng slug tiếng Việt không dấu (vd: `/tin-tuc/chi-phi-di-nhat-2026`)
- Sinh `sitemap.xml` và `robots.txt` tự động
- Dữ liệu có cấu trúc (JSON-LD) cho Organization, Article, JobPosting
- Dùng `next/image`, render tĩnh/ISR cho trang công khai

## 3. Backend / Trang quản trị (`/admin`)

### Đăng nhập & phân quyền
- Trang đăng nhập riêng, toàn bộ `/admin` được bảo vệ
- Vai trò: **Quản trị viên** (toàn quyền, quản lý tài khoản) và **Biên tập viên** (chỉ quản lý nội dung)

### Quản lý bài viết (chức năng chính)
- Danh sách bài viết: tìm kiếm, lọc theo chuyên mục/trạng thái, phân trang
- Thêm / sửa / xóa bài viết với các trường: tiêu đề, slug (tự sinh, sửa được), ảnh đại diện, mô tả ngắn, nội dung (rich text), chuyên mục, thẻ (tag), tác giả
- Trạng thái: **Nháp**, **Đã xuất bản**, **Hẹn giờ đăng**
- Đánh dấu bài nổi bật để hiện ở trang chủ
- Các trường SEO riêng: meta title, meta description, ảnh chia sẻ
- Xem trước bài viết trước khi xuất bản

### Quản lý nội dung khác
- **Chuyên mục bài viết:** CRUD (vd: Tin tức XKLĐ, Kinh nghiệm, Chính sách, Hoạt động công ty)
- **Thị trường:** CRUD nội dung từng thị trường
- **Đơn hàng tuyển dụng:** CRUD với các trường thị trường, ngành nghề, số lượng, giới tính, độ tuổi, mức lương, chi phí, hạn nộp hồ sơ, trạng thái (đang tuyển/đã đóng)
- **Đăng ký tư vấn / ứng tuyển:** xem danh sách, lọc, đổi trạng thái (mới, đã liên hệ, đã đỗ, hủy), ghi chú, xuất file Excel/CSV
- **Testimonial, FAQ, đối tác, banner trang chủ:** CRUD đơn giản
- **Thư viện ảnh:** upload, xem, xóa ảnh dùng lại được
- **Cài đặt chung:** tên công ty, logo, hotline, email, địa chỉ, link mạng xã hội, số giấy phép
- **Tài khoản người dùng admin:** thêm, sửa, khóa, đổi mật khẩu

### Dashboard
- Thống kê nhanh: số bài viết, số đơn hàng đang tuyển, số đăng ký mới trong 7 ngày, danh sách đăng ký mới nhất

## 4. Yêu cầu kỹ thuật

- Thiết kế schema Prisma đầy đủ cho các bảng trên, có migration và file seed dữ liệu mẫu (vài bài viết, thị trường, đơn hàng, một tài khoản admin mặc định)
- Validate dữ liệu cả phía client và server
- Chống spam cho form công khai (rate limit hoặc honeypot / reCAPTCHA)
- File `.env.example` liệt kê đủ biến môi trường
- Mã nguồn gọn, chia thư mục rõ ràng, có comment ở những chỗ quan trọng
- `README.md` hướng dẫn cài đặt, chạy local, chạy migration/seed và deploy (Vercel + PostgreSQL hoặc VPS dùng Docker)

## 5. Phong cách thiết kế

- Chuyên nghiệp, đáng tin cậy; màu chủ đạo [xanh dương / đỏ / màu thương hiệu], nền sáng
- Nhiều hình ảnh thật về người lao động, lớp học, lễ xuất cảnh
- Nút kêu gọi hành động rõ ràng, dễ bấm trên điện thoại

## 6. Cách làm

Hãy làm theo từng bước: (1) đề xuất cấu trúc thư mục và schema database để tôi xác nhận, (2) dựng phần xác thực và admin quản lý bài viết, (3) dựng các trang frontend, (4) các chức năng còn lại, SEO và hoàn thiện. Sau mỗi bước, tóm tắt những gì đã làm và cách kiểm tra.

### Thông tin công ty (điền vào)
- Tên công ty: [ ]
- Số giấy phép XKLĐ: [ ]
- Địa chỉ: [ ]
- Hotline / Zalo: [ ]
- Email: [ ]
- Thị trường chính: [ ]
