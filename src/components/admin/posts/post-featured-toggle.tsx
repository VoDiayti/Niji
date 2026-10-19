"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { togglePostFeatured } from "@/actions/posts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/** Ngôi sao bật/tắt nổi bật ngay trên danh sách bài viết */
export function PostFeaturedToggle({ id, isFeatured }: { id: string; isFeatured: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      aria-pressed={isFeatured}
      aria-label={isFeatured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}
      title={isFeatured ? "Bỏ đánh dấu nổi bật" : "Đánh dấu nổi bật"}
      onClick={() =>
        startTransition(async () => {
          const result = await togglePostFeatured(id, !isFeatured);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        })
      }
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <Star className={cn("size-4", isFeatured ? "fill-amber-400 text-amber-500" : "text-muted-foreground/60")} />
      )}
    </Button>
  );
}
