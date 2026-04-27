// Tipos públicos del motor de cálculo.
//
// Reflejan la estructura del cálculo de nómina española con la precisión
// normativa que el script Python original ya capturaba: cotizaciones SS,
// MEI, Cuota de Solidaridad, reducción Art. 20, gastos Art. 19, escala
// IRPF, mínimo personal aplicado como cuota, deducción SMI y tope del 43 %.

export interface TramoIRPF {
  /** Límite superior de la base imponible para este tramo (Infinity para el último). */
  readonly hasta: number;
  /** Tipo aplicado, en proporción decimal (e.g. 0.245 para 24.5 %). */
  readonly tipo: number;
}

export interface SolidaridadBand {
  /** Multiplicador sobre `baseMax` que define el límite superior de la banda. */
  readonly hastaMultiplicador: number;
  readonly tipo: number;
}

export interface SSTipos {
  /** Pares [empresa, trabajador] de cada concepto de cotización. */
  readonly comunes: readonly [number, number];
  readonly desempleo: readonly [number, number];
  readonly fogasa: readonly [number, number];
  readonly fp: readonly [number, number];
  readonly atep: readonly [number, number];
}

export type Art20Number = number | 'Transitorio';

export interface Art20Meta {
  readonly uInf: Art20Number;
  readonly rMax: Art20Number;
  readonly uSup: Art20Number;
  readonly rMin: Art20Number;
}

export interface Parametros {
  readonly anio: number;
  readonly baseMax: number;
  readonly ssTipos: SSTipos;
  readonly mei: readonly [number, number];
  /** Suma de ssTipos[*][0] + mei[0]. Precomputado para ahorrar trabajo en el hot path. */
  readonly tipoEmpresaTotal: number;
  /** Suma de ssTipos[*][1] + mei[1]. Precomputado para ahorrar trabajo en el hot path. */
  readonly tipoTrabajadorTotal: number;
  readonly solidaridad: readonly SolidaridadBand[];
  readonly irpfMinimo: number;
  readonly minimoExento: number;
  readonly gastosFijos: number;
  readonly art20Meta: Art20Meta;
  readonly tramosIRPF: readonly TramoIRPF[];
  readonly reduccionTrabajo: (rendimientoPrevio: number) => number;
  readonly deduccionSMI: (bruto: number) => number;
}

export interface CuotaTramo {
  readonly tipo: number;
  readonly cuota: number;
}

export interface Nomina {
  readonly bruto: number;
  readonly anio: number;
  readonly cotSocEmpresa: number;
  readonly costeLaboral: number;
  readonly cotSocTrabajador: number;
  readonly renPrevio: number;
  readonly gastosFijos: number;
  readonly redRenTrabajo: number;
  readonly baseImponible: number;
  readonly cuotasPorTramo: readonly CuotaTramo[];
  readonly cuotaIntegra: number;
  readonly cuotaMinimoPersonal: number;
  readonly cuotaTeorica: number;
  readonly deduccionSMI: number;
  readonly cuotaTrasSMI: number;
  readonly limite43: number;
  readonly irpfFinal: number;
  readonly salarioNeto: number;
}
