// Bulk computation: nóminas para los brutos enteros en [0, maxBruto].

import { calcularNomina } from './pipeline';
import type { Nomina } from './types';

export const MAX_BRUTO_DEFAULT = 100000;

/**
 * Devuelve un array de `Nomina` para `bruto = 0, 1, ..., maxBruto` en `anio`.
 * El índice del array coincide con el bruto (entero). Por defecto cubre el
 * rango completo 0–100 000 € que reproduce la salida del script Python.
 */
export function calcularAnoCompleto(anio: number, maxBruto: number = MAX_BRUTO_DEFAULT): Nomina[] {
  const out: Nomina[] = new Array<Nomina>(maxBruto + 1);
  for (let bruto = 0; bruto <= maxBruto; bruto++) {
    out[bruto] = calcularNomina(bruto, anio);
  }
  return out;
}
