import type { Parametros, TramoIRPF } from '../index.js';
import { INFLACION_A_2026, inflacionAcumulada } from '../inflacion.js';
import { ANIO_MIN, ANIO_MAX, obtenerParametros } from '../normativa.js';
import { calcularNomina, calcularNominaConParametros } from '../pipeline.js';

export interface GapSeries {
  readonly years: number[];
  readonly netoRealActual: number[];
  readonly netoRealIndexado: number[];
  readonly gap: number[];
  readonly gapHoy: number;
}

/**
 * Returns year-N parameters with every euro-denominated field scaled by
 * cumulative inflation 2012 → N. The closure fields use the wrapper trick
 * f_indexed(x) = alpha * f(x/alpha), valid because reduccionTrabajo and
 * deduccionSMI are piecewise-linear with euro breakpoints and euro outputs
 * (homogeneous of degree 1).
 */
export function parametrosIndexados(anio: number): Parametros {
  const base = obtenerParametros(anio);
  if (anio === 2012) return base;
  const alpha = inflacionAcumulada(2012, anio);
  const tramosIRPF: readonly TramoIRPF[] = base.tramosIRPF.map((t) => ({
    hasta: t.hasta * alpha,
    tipo: t.tipo,
  }));
  return {
    ...base,
    baseMax: base.baseMax * alpha,
    irpfMinimo: base.irpfMinimo * alpha,
    minimoExento: base.minimoExento * alpha,
    gastosFijos: base.gastosFijos * alpha,
    tramosIRPF,
    reduccionTrabajo: (rn) => alpha * base.reduccionTrabajo(rn / alpha),
    deduccionSMI: (bruto) => alpha * base.deduccionSMI(bruto / alpha),
  };
}

export function gapSeries(bruto2026: number): GapSeries {
  const years: number[] = [];
  const netoRealActual: number[] = [];
  const netoRealIndexado: number[] = [];
  const gap: number[] = [];

  for (let a = ANIO_MIN; a <= ANIO_MAX; a++) {
    const mult = INFLACION_A_2026[a];
    if (mult === undefined) {
      throw new Error(`No INFLACION_A_2026 entry for year ${String(a)}`);
    }
    const brutoNominal = bruto2026 / mult;
    const nActual = calcularNomina(brutoNominal, a).salarioNeto * mult;
    const nIndex = calcularNominaConParametros(brutoNominal, parametrosIndexados(a)).salarioNeto * mult;
    years.push(a);
    netoRealActual.push(nActual);
    netoRealIndexado.push(nIndex);
    gap.push(nIndex - nActual);
  }

  return {
    years,
    netoRealActual,
    netoRealIndexado,
    gap,
    gapHoy: gap[gap.length - 1] ?? 0,
  };
}
