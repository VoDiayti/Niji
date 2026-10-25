import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Wallet } from "lucide-react";
import type { TrainingProgram } from "@/db/types";
import { PROGRAM_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProgramCardData = Pick<TrainingProgram, "title" | "slug" | "type" | "summary" | "image" | "duration" | "tuition">;

export function ProgramCard({ program, className }: { program: ProgramCardData; className?: string }) {
  const href = `/du-hoc-dao-tao/${program.slug}`;
  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg", className)}>
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={program.title}>
        {program.image ? (
          <Image
            src={program.image}
            alt={program.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
        )}
        <Badge className="absolute left-3 top-3 bg-white/95 text-primary shadow-sm hover:bg-white">{PROGRAM_TYPE_LABELS[program.type]}</Badge>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug md:text-lg">
          <Link href={href} className="hover:text-primary">
            {program.title}
          </Link>
        </h3>
        {program.summary && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{program.summary}</p>}
        <ul className="mt-4 space-y-1.5 text-sm">
          {program.duration && (
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{program.duration}</span>
            </li>
          )}
          {program.tuition && (
            <li className="flex gap-2">
              <Wallet className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="line-clamp-2">{program.tuition}</span>
            </li>
          )}
        </ul>
        <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary group-hover:gap-2">
          Tìm hiểu chương trình <ArrowRight className="size-4 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
