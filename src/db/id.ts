const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

/** Sinh ID ngẫu nhiên 25 ký tự (dạng giống cuid: bắt đầu bằng "c") – dùng WebCrypto nên chạy được trên Workers. */
export function createId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  let id = "c";
  for (const b of bytes) id += ALPHABET[b % ALPHABET.length];
  return id;
}
