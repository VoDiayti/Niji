/**
 * Băm mật khẩu bằng PBKDF2-SHA256 qua WebCrypto – chạy được cả trên Cloudflare Workers lẫn Node.js
 * (bcrypt thuần JS quá chậm với giới hạn CPU của Workers).
 * Định dạng lưu: pbkdf2$sha256$<số vòng>$<salt base64>$<hash base64>
 * Số vòng được lưu kèm nên có thể đổi PASSWORD_HASH_ITERATIONS mà mật khẩu cũ vẫn kiểm tra được.
 */
const DEFAULT_ITERATIONS = Number(process.env.PASSWORD_HASH_ITERATIONS ?? 100_000);
const KEY_BYTES = 32;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, KEY_BYTES * 8);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, iterations = DEFAULT_ITERATIONS): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt, iterations);
  return `pbkdf2$sha256$${iterations}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") return false;
  const iterations = Number(parts[2]);
  if (!Number.isFinite(iterations) || iterations < 1000) return false;
  const expected = fromBase64(parts[4]);
  const actual = await derive(password, fromBase64(parts[3]), iterations);
  if (actual.length !== expected.length) return false;
  // so sánh thời gian hằng số
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
