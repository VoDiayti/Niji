"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold, Code, Heading2, Heading3, Heading4, Image as ImageIcon, Italic,
  Link2, List, ListOrdered, LoaderCircle, Minus, Pilcrow, Quote, Redo2, RemoveFormatting, Strikethrough, Table, TextAlignCenter, TextAlignEnd, TextAlignJustify, TextAlignStart, Underline,
  Undo2, Unlink, Video,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Chiều cao tối thiểu vùng soạn thảo (px) */
  minHeight?: number;
};

/**
 * Trình soạn thảo rich text (TipTap) dùng trong admin.
 * Hỗ trợ: tiêu đề, in đậm/nghiêng/gạch chân, danh sách, trích dẫn, căn lề, liên kết,
 * chèn ảnh (upload hoặc URL, kéo-thả/dán), video YouTube, bảng.
 */
export function RichTextEditor({ value, onChange, placeholder = "Nhập nội dung...", className, minHeight = 360 }: RichTextEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const insertFiles = useCallback(async (files: File[], pos?: number) => {
    const editor = editorRef.current;
    if (!editor || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const uploaded = await uploadImage(file);
        if (pos != null) {
          editor.chain().focus().insertContentAt(pos, { type: "image", attrs: { src: uploaded.url, alt: uploaded.alt } }).run();
        } else {
          editor.chain().focus().setImage({ src: uploaded.url, alt: uploaded.alt }).run();
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      TableKit.configure({ table: { resizable: true } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-neutral max-w-none px-4 py-3 focus:outline-none",
        style: `min-height:${minHeight}px`,
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        void insertFiles(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void insertFiles(files, pos);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Giữ tham chiếu editor cho các handler paste/drop (được tạo một lần trong editorProps)
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Đồng bộ khi giá trị bên ngoài thay đổi (vd: reset form) mà không tạo vòng lặp
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !editor.isFocused) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const selectedState = useEditorState({
    editor,
    selector: ({ editor }) => (editor ? readToolbarState(editor) : null),
  });

  if (!editor) {
    return <div className={cn("rounded-lg border bg-background", className)} style={{ minHeight: minHeight + 44 }} />;
  }
  // useEditorState chỉ làm mới snapshot sau transaction đầu tiên; nếu nội dung ban đầu không tạo transaction
  // thì selector vẫn thấy editor = null → đọc trực tiếp từ editor để toolbar luôn hiển thị.
  const state = selectedState ?? readToolbarState(editor);

  const openLinkDialog = () => {
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkOpen(true);
  };
  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkOpen(false);
  };
  const applyImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: imageAlt.trim() || undefined }).run();
    setImageOpen(false);
    setImageUrl("");
    setImageAlt("");
  };
  const applyYoutube = () => {
    const url = youtubeUrl.trim();
    if (!url) return;
    const ok = editor.commands.setYoutubeVideo({ src: url });
    if (!ok) toast.error("Đường dẫn YouTube không hợp lệ");
    setYoutubeOpen(false);
    setYoutubeUrl("");
  };

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring/40", className)}>
      {/* Thanh công cụ */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-muted/60 p-1">
        <ToolbarButton label="Hoàn tác" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></ToolbarButton>
        <ToolbarButton label="Làm lại" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></ToolbarButton>
        <Divider />
        <ToolbarButton label="Đoạn văn" active={state.paragraph} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow /></ToolbarButton>
        <ToolbarButton label="Tiêu đề 2" active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolbarButton>
        <ToolbarButton label="Tiêu đề 3" active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolbarButton>
        <ToolbarButton label="Tiêu đề 4" active={state.h4} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 /></ToolbarButton>
        <Divider />
        <ToolbarButton label="In đậm" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
        <ToolbarButton label="In nghiêng" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
        <ToolbarButton label="Gạch chân" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline /></ToolbarButton>
        <ToolbarButton label="Gạch ngang" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></ToolbarButton>
        <ToolbarButton label="Xóa định dạng" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting /></ToolbarButton>
        <Divider />
        <ToolbarButton label="Danh sách" active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
        <ToolbarButton label="Danh sách số" active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
        <ToolbarButton label="Trích dẫn" active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolbarButton>
        <ToolbarButton label="Khối mã" active={state.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code /></ToolbarButton>
        <ToolbarButton label="Đường kẻ ngang" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></ToolbarButton>
        <Divider />
        <ToolbarButton label="Căn trái" active={state.alignLeft} onClick={() => editor.chain().focus().setTextAlign("left").run()}><TextAlignStart /></ToolbarButton>
        <ToolbarButton label="Căn giữa" active={state.alignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()}><TextAlignCenter /></ToolbarButton>
        <ToolbarButton label="Căn phải" active={state.alignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()}><TextAlignEnd /></ToolbarButton>
        <ToolbarButton label="Căn đều" active={state.alignJustify} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><TextAlignJustify /></ToolbarButton>
        <Divider />
        <ToolbarButton label="Chèn liên kết" active={state.link} onClick={openLinkDialog}><Link2 /></ToolbarButton>
        {state.link && (
          <ToolbarButton label="Bỏ liên kết" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink /></ToolbarButton>
        )}
        <ToolbarButton label="Chèn ảnh" disabled={uploading} onClick={() => setImageOpen(true)}>
          {uploading ? <LoaderCircle className="animate-spin" /> : <ImageIcon />}
        </ToolbarButton>
        <ToolbarButton label="Chèn video YouTube" onClick={() => setYoutubeOpen(true)}><Video /></ToolbarButton>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Bảng" onMouseDown={(e) => e.preventDefault()} className={cn("h-8 w-8", state.table && "bg-primary/10 text-primary")}>
                  <Table />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Bảng</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Chèn bảng 3×3</DropdownMenuItem>
            {state.table && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => editor.chain().focus().addRowAfter().run()}>Thêm hàng bên dưới</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().addColumnAfter().run()}>Thêm cột bên phải</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeaderRow().run()}>Bật/tắt hàng tiêu đề</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => editor.chain().focus().deleteRow().run()}>Xóa hàng</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => editor.chain().focus().deleteColumn().run()}>Xóa cột</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => editor.chain().focus().deleteTable().run()}>Xóa bảng</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          setImageOpen(false);
          void insertFiles(files);
        }}
      />

      {/* Hộp thoại liên kết */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Chèn liên kết</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rte-link">Đường dẫn (URL)</Label>
            <Input id="rte-link" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyLink())} />
          </div>
          <DialogFooter>
            {state.link && <Button type="button" variant="outline" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}>Bỏ liên kết</Button>}
            <Button type="button" onClick={applyLink}>Áp dụng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hộp thoại ảnh */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Chèn ảnh</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Button type="button" variant="secondary" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon /> Tải ảnh lên từ máy tính
            </Button>
            <div className="relative text-center text-xs text-muted-foreground"><span className="bg-background px-2">hoặc dán đường dẫn ảnh</span><div className="absolute inset-x-0 top-1/2 -z-10 border-t" /></div>
            <div className="space-y-2">
              <Label htmlFor="rte-img-url">URL ảnh</Label>
              <Input id="rte-img-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rte-img-alt">Mô tả ảnh (alt)</Label>
              <Input id="rte-img-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Mô tả ngắn cho SEO" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={applyImageUrl} disabled={!imageUrl.trim()}>Chèn ảnh</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hộp thoại YouTube */}
      <Dialog open={youtubeOpen} onOpenChange={setYoutubeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Chèn video YouTube</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rte-yt">Đường dẫn video</Label>
            <Input id="rte-yt" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyYoutube())} />
          </div>
          <DialogFooter>
            <Button type="button" onClick={applyYoutube} disabled={!youtubeUrl.trim()}>Chèn video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Trạng thái các nút trên thanh công cụ (đọc từ editor) */
function readToolbarState(editor: Editor) {
  return {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    strike: editor.isActive("strike"),
    paragraph: editor.isActive("paragraph"),
    h2: editor.isActive("heading", { level: 2 }),
    h3: editor.isActive("heading", { level: 3 }),
    h4: editor.isActive("heading", { level: 4 }),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    blockquote: editor.isActive("blockquote"),
    codeBlock: editor.isActive("codeBlock"),
    link: editor.isActive("link"),
    alignLeft: editor.isActive({ textAlign: "left" }),
    alignCenter: editor.isActive({ textAlign: "center" }),
    alignRight: editor.isActive({ textAlign: "right" }),
    alignJustify: editor.isActive({ textAlign: "justify" }),
    table: editor.isActive("table"),
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };
}

function ToolbarButton({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={active}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
          className={cn("h-8 w-8 [&_svg]:size-4", active && "bg-primary/10 text-primary")}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}
