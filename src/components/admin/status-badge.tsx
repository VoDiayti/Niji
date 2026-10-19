import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JOB_STATUS_LABELS, LEAD_STATUS_LABELS, POST_STATUS_LABELS } from "@/lib/constants";
import type { JobStatus, LeadStatus, PostStatus } from "@/generated/prisma/enums";

const POST_STYLES: Record<PostStatus, string> = {
  DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SCHEDULED: "bg-amber-50 text-amber-700 border-amber-200",
};
const JOB_STYLES: Record<JobStatus, string> = {
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-neutral-100 text-neutral-600 border-neutral-200",
};
const LEAD_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-amber-50 text-amber-700 border-amber-200",
  PASSED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return <Badge variant="outline" className={cn(POST_STYLES[status])}>{POST_STATUS_LABELS[status]}</Badge>;
}
export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge variant="outline" className={cn(JOB_STYLES[status])}>{JOB_STATUS_LABELS[status]}</Badge>;
}
export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant="outline" className={cn(LEAD_STYLES[status])}>{LEAD_STATUS_LABELS[status]}</Badge>;
}
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant="outline" className={cn(active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-100 text-neutral-600 border-neutral-200")}>
      {active ? "Hiển thị" : "Ẩn"}
    </Badge>
  );
}
