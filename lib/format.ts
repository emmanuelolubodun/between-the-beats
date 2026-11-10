// Plain-language number helpers. Every number reads as "X in 100" for a lay reader.

/** Format with a fixed number of decimals, dropping a trailing ".0" only when asked. */
export function num(v: number, decimals = 1): string {
  return v.toFixed(decimals);
}

/** "38 in 100" style phrasing. Keeps one decimal unless the value is whole. */
export function inHundred(v: number): string {
  const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return `${s} in 100`;
}

export type Direction = 'above' | 'below' | 'level';

export interface Comparison {
  diff: number;
  direction: Direction;
  label: string; // "4.1 above", "6.1 below", "level with"
}

/** Signed, labeled difference against a reference value. */
export function compareToReference(v: number, ref: number): Comparison {
  const diff = Math.round((v - ref) * 10) / 10;
  if (diff === 0) return { diff, direction: 'level', label: 'level with' };
  const direction: Direction = diff > 0 ? 'above' : 'below';
  return { diff, direction, label: `${Math.abs(diff).toFixed(1)} ${direction}` };
}

/** 1 -> "1st", 22 -> "22nd". */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
