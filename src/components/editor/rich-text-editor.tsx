"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

/**
 * Trình soạn thảo chỉ tải ở phía trình duyệt (ssr: false): TipTap/ProseMirror không cần render trên server,
 * nhờ đó bundle Worker nhỏ hơn và trang admin tải nhanh hơn. API giữ nguyên: <RichTextEditor value onChange ... />.
 */
const RichTextEditorImpl = dynamic(() => import("./rich-text-editor-impl").then((m) => m.RichTextEditor), {
  ssr: false,
  loading: () => <div className="min-h-[404px] animate-pulse rounded-lg border bg-muted/40" aria-busy="true" />,
});

export type RichTextEditorProps = ComponentProps<typeof RichTextEditorImpl>;

export function RichTextEditor(props: RichTextEditorProps) {
  return <RichTextEditorImpl {...props} />;
}
