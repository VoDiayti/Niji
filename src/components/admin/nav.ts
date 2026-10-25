import {
  Briefcase, ClipboardList, FileText, FolderOpen, Globe, GraduationCap, Handshake, Image as ImageIcon, LayoutDashboard, LayoutList,
  MessageCircle, PanelTop, Quote, Settings, Tag, UserCog, type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; adminOnly?: boolean };
export type AdminNavGroup = { title: string; items: AdminNavItem[] };

/** Cấu trúc menu admin – thêm module mới tại đây */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Tổng quan",
    items: [{ href: "/admin", label: "Bảng điều khiển", icon: LayoutDashboard }],
  },
  {
    title: "Nội dung",
    items: [
      { href: "/admin/bai-viet", label: "Bài viết", icon: FileText },
      { href: "/admin/chuyen-muc", label: "Chuyên mục", icon: FolderOpen },
      { href: "/admin/the", label: "Thẻ (tag)", icon: Tag },
      { href: "/admin/thi-truong", label: "Thị trường", icon: Globe },
      { href: "/admin/don-hang", label: "Đơn hàng tuyển dụng", icon: Briefcase },
      { href: "/admin/chuong-trinh", label: "Chương trình (tab đơn hàng)", icon: LayoutList },
      { href: "/admin/dao-tao", label: "Du học – Đào tạo", icon: GraduationCap },
    ],
  },
  {
    title: "Khách hàng",
    items: [{ href: "/admin/dang-ky", label: "Đăng ký tư vấn", icon: ClipboardList }],
  },
  {
    title: "Trang chủ",
    items: [
      { href: "/admin/banner", label: "Banner", icon: PanelTop },
      { href: "/admin/cam-nhan", label: "Cảm nhận học viên", icon: Quote },
      { href: "/admin/faq", label: "Câu hỏi thường gặp", icon: MessageCircle },
      { href: "/admin/doi-tac", label: "Đối tác", icon: Handshake },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/admin/thu-vien-anh", label: "Thư viện ảnh", icon: ImageIcon },
      { href: "/admin/cai-dat", label: "Cài đặt chung", icon: Settings },
      { href: "/admin/tai-khoan", label: "Tài khoản admin", icon: UserCog, adminOnly: true },
    ],
  },
];
