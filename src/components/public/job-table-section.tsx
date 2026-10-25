import { SectionHeading } from "@/components/public/section-heading";
import { JobTableTabs } from "@/components/public/job-table-tabs";
import type { JobTableGroup } from "@/lib/queries/job-programs";

/** Khối "bảng đơn hàng theo chương trình" trên trang chủ (tiêu đề và bật/tắt chỉnh trong Admin → Cài đặt chung) */
export function JobTableSection({ title, groups }: { title: string; groups: JobTableGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <section className="bg-background py-14 md:py-20" id="bang-don-hang">
      <div className="container-page">
        <SectionHeading
          label="Đơn hàng đang tuyển"
          title={title}
          description="Chọn chương trình để xem các đơn hàng đang tuyển, số lượng, nơi làm việc, mức lương và ngày phỏng vấn dự kiến."
          className="mb-8 md:mb-10"
        />
        <JobTableTabs groups={groups} />
      </div>
    </section>
  );
}
