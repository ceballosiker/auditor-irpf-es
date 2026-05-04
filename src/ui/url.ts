import { ANIOS_SOPORTADOS } from '../normativa.js';

/**
 * Parse `?anio=YYYY` from a URL search string. Returns the year if it is an
 * integer inside `ANIOS_SOPORTADOS`; otherwise null. Pure, no DOM access.
 */
export function parseAnioFromSearch(search: string): number | null {
  const params = new URLSearchParams(search);
  const raw = params.get('anio');
  if (raw === null || raw === '') return null;
  if (!/^-?\d+$/.test(raw)) return null;
  const n = Number.parseInt(raw, 10);
  return ANIOS_SOPORTADOS.includes(n) ? n : null;
}

/**
 * Update `?anio=YYYY` in the current URL via history.replaceState (no nav).
 * Idempotent: writing the same year twice is a no-op for the user.
 */
export function writeAnioToUrl(anio: number): void {
  const url = new URL(window.location.href);
  url.searchParams.set('anio', String(anio));
  window.history.replaceState(null, '', url.toString());
}
