import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Các trang công khai render động (đọc D1 mỗi request) nên không cần incremental cache / queue / tag cache.
// Muốn bật ISR sau này: xem https://opennext.js.org/cloudflare/caching
export default defineCloudflareConfig({});
