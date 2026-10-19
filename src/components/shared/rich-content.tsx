import "server-only";
import { sanitizeRichText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

/** Render HTML từ trình soạn thảo (đã sanitize) với style typography */
export function RichContent({ html, className }: { html: string | null | undefined; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={cn(
        "rich-text prose prose-neutral max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl prose-img:mx-auto",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}
