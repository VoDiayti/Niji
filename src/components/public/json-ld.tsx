import type { JsonLdObject } from "@/lib/seo";

/** Nhúng dữ liệu cấu trúc JSON-LD vào trang */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      // Thay "<" để tránh đóng thẻ script sớm khi nội dung có HTML
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
