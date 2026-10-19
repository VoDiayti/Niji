/** Tiện ích đọc searchParams (Next 16: searchParams là Promise<Record<string, string | string[] | undefined>>) */
export type SearchParams = Record<string, string | string[] | undefined>;

export function paramString(value: string | string[] | undefined, max = 200): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  const trimmed = v?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function paramPage(value: string | string[] | undefined): number {
  const n = Number.parseInt(paramString(value) ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
