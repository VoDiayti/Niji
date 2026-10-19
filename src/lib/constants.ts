// Nhãn tiếng Việt cho các enum trong database + dữ liệu dùng chung
import type { Gender, JobStatus, LeadStatus, LeadType, PostStatus, ProgramType, Role } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  EDITOR: "Biên tập viên",
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  SCHEDULED: "Hẹn giờ đăng",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  OPEN: "Đang tuyển",
  CLOSED: "Đã đóng",
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  ANY: "Nam / Nữ",
};

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  CONSULTATION: "Đăng ký tư vấn",
  APPLICATION: "Ứng tuyển",
  CONTACT: "Liên hệ",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Mới",
  CONTACTED: "Đã liên hệ",
  PASSED: "Đã đỗ",
  CANCELLED: "Hủy",
};

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  STUDY_ABROAD: "Du học nghề",
  LANGUAGE: "Đào tạo tiếng",
  VOCATIONAL: "Đào tạo kỹ năng nghề",
};

/** Khoảng lương (VNĐ/tháng) dùng cho bộ lọc đơn hàng */
export const SALARY_RANGES = [
  { value: "duoi-20", label: "Dưới 20 triệu", min: 0, max: 20_000_000 },
  { value: "20-30", label: "20 – 30 triệu", min: 20_000_000, max: 30_000_000 },
  { value: "30-40", label: "30 – 40 triệu", min: 30_000_000, max: 40_000_000 },
  { value: "tren-40", label: "Trên 40 triệu", min: 40_000_000, max: Number.MAX_SAFE_INTEGER },
] as const;

/** Khoảng tuổi dùng cho bộ lọc đơn hàng */
export const AGE_RANGES = [
  { value: "18-25", label: "18 – 25 tuổi", min: 18, max: 25 },
  { value: "26-30", label: "26 – 30 tuổi", min: 26, max: 30 },
  { value: "31-35", label: "31 – 35 tuổi", min: 31, max: 35 },
  { value: "tren-35", label: "Trên 35 tuổi", min: 36, max: 99 },
] as const;

/** Menu điều hướng trang công khai */
export const PUBLIC_NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/thi-truong", label: "Thị trường" },
  { href: "/don-hang", label: "Đơn hàng" },
  { href: "/du-hoc-dao-tao", label: "Du học – Đào tạo" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/cau-hoi-thuong-gap", label: "Hỏi đáp" },
  { href: "/lien-he", label: "Liên hệ" },
] as const;

/** Số bài / đơn hàng mỗi trang */
export const PAGE_SIZE = 12;
export const ADMIN_PAGE_SIZE = 20;
