import { Award, Globe, Handshake, Users } from "lucide-react";
import type { Setting } from "@/db/types";
import { formatNumber } from "@/lib/format";

type StatsProps = Pick<Setting, "statWorkers" | "statYears" | "statPartners" | "statMarkets">;

/** Con số ấn tượng – nền xanh đậm */
export function StatsSection({ statWorkers, statYears, statPartners, statMarkets }: StatsProps) {
  const stats = [
    { value: statWorkers, suffix: "+", label: "Lao động đã xuất cảnh", Icon: Users },
    { value: statYears, suffix: "+", label: "Năm kinh nghiệm", Icon: Award },
    { value: statPartners, suffix: "+", label: "Đối tác tiếp nhận", Icon: Handshake },
    { value: statMarkets, suffix: "", label: "Thị trường lao động", Icon: Globe },
  ].filter((s) => s.value != null && s.value > 0);

  if (stats.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-brand-dark py-14 text-white md:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-brand-dark to-brand-dark" aria-hidden="true" />
      <div className="absolute -left-20 top-0 size-72 rounded-full bg-cta/20 blur-3xl" aria-hidden="true" />
      <div className="container-page relative">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Con số ấn tượng</p>
          <h2 className="mt-2 text-2xl font-bold md:text-4xl">Niềm tin được xây dựng qua từng chuyến bay</h2>
        </div>
        <dl className={`grid grid-cols-2 gap-4 md:gap-6 ${stats.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur md:p-7">
              <s.Icon className="mx-auto size-8 text-amber-300" />
              <dd className="mt-3 text-3xl font-extrabold tabular-nums md:text-5xl">
                {formatNumber(s.value)}
                <span className="text-amber-300">{s.suffix}</span>
              </dd>
              <dt className="mt-1.5 text-sm text-white/80 md:text-base">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
