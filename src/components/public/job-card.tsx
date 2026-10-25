import Image from "next/image";
import Link from "next/link";
import { Banknote, Briefcase, CalendarClock, MapPin, UserRound, Users } from "lucide-react";
import { GENDER_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { isDeadlinePassed, type JobCardData } from "@/lib/queries/job-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/public/country-flag";
import { cn } from "@/lib/utils";

export function formatAgeRange(min: number | null, max: number | null): string {
  if (min && max) return `${min} – ${max} tuổi`;
  if (min) return `Từ ${min} tuổi`;
  if (max) return `Đến ${max} tuổi`;
  return "Không giới hạn";
}

/** Card đơn hàng dùng ở trang chủ, danh sách, thị trường, liên quan */
export function JobCard({ job, className }: { job: JobCardData; className?: string }) {
  const href = `/don-hang/${job.slug}`;
  const expired = isDeadlinePassed(job.deadline);

  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg", className)}>
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={job.title}>
        {job.image ? (
          <Image
            src={job.image}
            alt={job.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge className="gap-1 bg-white/95 text-foreground shadow-sm hover:bg-white">
            <CountryFlag code={job.market.countryCode} className="text-sm" />
            {job.market.name}
          </Badge>
        </div>
        {job.isFeatured && <Badge className="absolute right-3 top-3 bg-cta text-cta-foreground shadow-sm">Nổi bật</Badge>}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <Briefcase className="size-3.5" /> {job.industry}
        </p>
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground md:text-lg">
          <Link href={href} className="hover:text-primary">
            {job.title}
          </Link>
        </h3>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div className="flex items-start gap-1.5">
            <Users className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="sr-only">Số lượng</dt>
              <dd>{job.quantity} người</dd>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="sr-only">Giới tính</dt>
              <dd>{GENDER_LABELS[job.gender]}</dd>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="sr-only">Độ tuổi</dt>
              <dd>{formatAgeRange(job.ageMin, job.ageMax)}</dd>
            </div>
          </div>
          {job.location && (
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="sr-only">Nơi làm việc</dt>
                <dd className="line-clamp-1">{job.location}</dd>
              </div>
            </div>
          )}
        </dl>

        {job.salaryText && (
          <p className="mt-3 flex items-start gap-1.5 text-sm">
            <Banknote className="mt-0.5 size-4 shrink-0 text-primary" />
            <span className="font-semibold text-primary">{job.salaryText}</span>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <p className={cn("text-xs", expired ? "text-destructive" : "text-muted-foreground")}>
            {job.deadline ? (
              <>
                Hạn nộp: <span className="font-semibold">{formatDate(job.deadline)}</span>
              </>
            ) : (
              "Tuyển liên tục"
            )}
          </p>
          <Button asChild size="sm" className="h-9 bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href={`${href}#ung-tuyen`}>Ứng tuyển</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
