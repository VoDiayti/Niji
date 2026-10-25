import { ClipboardCheck, GraduationCap, Handshake, FileCheck, PlaneTakeoff, Stethoscope } from "lucide-react";
import { SectionHeading } from "@/components/public/section-heading";

const STEPS = [
  { title: "Đăng ký tư vấn", description: "Để lại thông tin hoặc gọi hotline, tư vấn viên kiểm tra điều kiện và giới thiệu đơn hàng phù hợp.", Icon: ClipboardCheck },
  { title: "Khám sức khỏe & sơ tuyển", description: "Khám tại bệnh viện được chỉ định, sơ tuyển thể lực, tay nghề và hoàn thiện hồ sơ đăng ký.", Icon: Stethoscope },
  { title: "Đào tạo tiếng & kỹ năng", description: "Học ngoại ngữ, kỹ năng nghề, tác phong và văn hóa doanh nghiệp tại trung tâm đào tạo của công ty.", Icon: GraduationCap },
  { title: "Thi tuyển với đối tác", description: "Phỏng vấn trực tiếp hoặc trực tuyến với nghiệp đoàn, doanh nghiệp tiếp nhận; được luyện phỏng vấn trước.", Icon: Handshake },
  { title: "Hoàn thiện hồ sơ visa", description: "Công ty hỗ trợ trọn gói hồ sơ xin tư cách lưu trú, visa, hợp đồng lao động minh bạch.", Icon: FileCheck },
  { title: "Xuất cảnh & hỗ trợ tại nước ngoài", description: "Đưa đón sân bay, hướng dẫn nhập trại, cán bộ đại diện hỗ trợ suốt thời gian làm việc.", Icon: PlaneTakeoff },
];

/** Quy trình tham gia xuất khẩu lao động 6 bước */
export function ProcessSteps() {
  return (
    <section className="bg-background py-14 md:py-20">
      <div className="container-page">
        <SectionHeading
          label="Quy trình"
          title="6 bước để đi làm việc ở nước ngoài"
          description="Lộ trình rõ ràng, được đồng hành từ lúc đăng ký cho đến khi về nước. Bạn chỉ cần chuẩn bị sức khỏe và quyết tâm."
        />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="group relative flex gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-light text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.Icon className="size-6" />
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Bước {i + 1}</p>
                <h3 className="mt-1 text-lg font-bold leading-snug">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
              <span className="absolute right-4 top-3 text-5xl font-black text-brand-light/80 select-none" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
