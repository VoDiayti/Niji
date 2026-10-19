import { cn } from "@/lib/utils";

/** Chuyển mã quốc gia ISO-2 (JP, KR, TW, DE, EU...) thành emoji cờ */
export function countryFlag(code: string | null | undefined): string | null {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return null;
  const points = [...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...points);
}

export function CountryFlag({ code, className }: { code: string | null | undefined; className?: string }) {
  const flag = countryFlag(code);
  if (!flag) return null;
  return (
    <span aria-hidden="true" className={cn("inline-block leading-none", className)}>
      {flag}
    </span>
  );
}
