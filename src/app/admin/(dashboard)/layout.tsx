import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-guard";
import { getSettings } from "@/lib/queries/settings";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị" },
  robots: { index: false, follow: false },
};

/** Layout khu vực quản trị: yêu cầu đăng nhập (proxy đã chặn, kiểm tra lại ở đây cho chắc) */
export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const setting = await getSettings();
  const companyName = setting.shortName || setting.companyName || "Quản trị";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar role={user.role} companyName={companyName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader user={user} companyName={companyName} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
