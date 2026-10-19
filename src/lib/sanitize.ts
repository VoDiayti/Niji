import sanitizeHtml from "sanitize-html";

/**
 * Làm sạch HTML từ trình soạn thảo trước khi render ra trang công khai.
 * Cho phép: định dạng cơ bản, tiêu đề, danh sách, bảng, ảnh, video YouTube (iframe), căn lề.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img", "iframe", "figure", "figcaption", "h1", "h2", "u", "s", "span", "div", "mark", "col", "colgroup",
    ],
    allowedAttributes: {
      "*": ["class", "style", "id"],
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
      div: ["data-youtube-video"],
      td: ["colspan", "rowspan", "colwidth"],
      th: ["colspan", "rowspan", "colwidth"],
      col: ["style", "span"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "youtube.com", "player.vimeo.com", "www.google.com"],
    allowedStyles: {
      "*": {
        "text-align": [/^(left|right|center|justify)$/],
        width: [/^\d+(?:px|%)$/],
        "min-width": [/^\d+(?:px|%)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.target === "_blank" ? { ...attribs, rel: "noopener noreferrer" } : attribs,
      }),
    },
  });
}
