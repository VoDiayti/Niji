import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings/settings-form";

export const metadata: Metadata = { title: "Cài đặt chung" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  const saved = settings.updatedAt.getTime() > 0;

  return (
    <>
      <PageHeader
        title="Cài đặt chung"
        description={saved ? `Thông tin công ty, liên hệ, mạng xã hội, SEO. Cập nhật lần cuối ${formatDateTime(settings.updatedAt)}.` : "Chưa có cài đặt – đang dùng giá trị mặc định, hãy điền và lưu."}
      />
      <SettingsForm initialData={settings} />
    </>
  );
}
