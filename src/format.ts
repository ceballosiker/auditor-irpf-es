// Rounding helpers compatible with CPython's `round(x, n)` on Python floats.
//
// The naive `Math.round(n * 10^d) / 10^d` approach loses precision at the
// `n * 10^d` step (e.g. 2486.0250000000004 * 100 collapses to exactly
// 248602.5 in IEEE 754), which then triggers banker's rounding incorrectly.
// CPython's round looks at the float's true decimal expansion (via dtoa)
// and applies banker's only on EXACT halves. We replicate that by reading
// the expansion via toFixed(20).

export function roundN(n: number, decimals: number): number {
  if (!Number.isFinite(n) || n === 0) return n;
  if (decimals < 0) throw new Error('roundN: decimals must be >= 0');
  const sign = n < 0 ? -1 : 1;
  const s = Math.abs(n).toFixed(20);
  const [intPartRaw = '0', fracPartRaw = ''] = s.split('.');
  if (fracPartRaw.length <= decimals) return n;
  const keep = fracPartRaw.slice(0, decimals);
  const rest = fracPartRaw.slice(decimals);
  const halfRest = `5${'0'.repeat(rest.length - 1)}`;
  let increment: 0 | 1;
  if (rest > halfRest) {
    increment = 1;
  } else if (rest < halfRest) {
    increment = 0;
  } else {
    // Exact half — banker's: round to even
    const lastKeptCharCode =
      decimals === 0 ? intPartRaw.charCodeAt(intPartRaw.length - 1) : keep.charCodeAt(decimals - 1);
    increment = (lastKeptCharCode - 48) % 2 === 0 ? 0 : 1;
  }
  const baseStr = decimals === 0 ? intPartRaw : `${intPartRaw}.${keep}`;
  const base = Number(baseStr);
  const step = decimals === 0 ? 1 : Number(`0.${'0'.repeat(decimals - 1)}1`);
  return sign * Number((base + increment * step).toFixed(decimals));
}

export const r1 = (n: number): number => roundN(n, 1);
export const r2 = (n: number): number => roundN(n, 2);
export const r3 = (n: number): number => roundN(n, 3);

/**
 * Reproduces Python's `f"T{i+1} ({round(tipo*100, 1)}%)"` exactly. Uses
 * `toFixed(1)` so integer-valued tipos (0.19, 0.24, 0.30, ...) render as
 * "19.0", "24.0", etc.
 */
export function tramoLabel(idx: number, tipo: number): string {
  const pct = r1(tipo * 100);
  return `T${String(idx + 1)} (${pct.toFixed(1)}%)`;
}
