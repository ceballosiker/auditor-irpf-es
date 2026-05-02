// Excel exporter (vía SheetJS). Reproduce las pestañas del script Python:
//   CONTROL_GENERAL, CONTROL_TRAMOS_IRPF, COMPARATIVA_INFLACION, DAT_YYYY.

import { utils, write, writeFile, type WorkBook, type WorkSheet } from 'xlsx';
import { calcularAnoCompleto, MAX_BRUTO_DEFAULT } from './bulk';
import { nominaToFila, r2, r3, roundN } from './format';
import { INFLACION_A_2026 } from './inflacion';
import { ANIOS_SOPORTADOS, obtenerParametros } from './normativa';
import { calcularNominaConParametros } from './pipeline';
import type { Nomina, Parametros } from './types';

/** Bruto mínimo (en € de 2026) para la tabla COMPARATIVA_INFLACION. */
export const COMPARATIVA_BRUTO_MIN = 15000;
/** Bruto máximo (en € de 2026) para la tabla COMPARATIVA_INFLACION. */
export const COMPARATIVA_BRUTO_MAX = 100000;
/** Paso entre brutos en COMPARATIVA_INFLACION. */
export const COMPARATIVA_BRUTO_STEP = 1000;
/** Número de filas que COMPARATIVA_INFLACION genera por año. */
export const COMPARATIVA_FILAS_POR_ANIO =
  (COMPARATIVA_BRUTO_MAX - COMPARATIVA_BRUTO_MIN) / COMPARATIVA_BRUTO_STEP + 1;

export interface GenerarExcelOptions {
  /** Años a incluir como pestañas DAT_YYYY. Default: 2012–2026. */
  readonly anios?: readonly number[];
  /** Bruto máximo para las pestañas DAT_YYYY. Default: 100 000 €. */
  readonly maxBruto?: number;
}

function buildControlGeneral(anios: readonly number[]): Record<string, number | string>[] {
  return anios.map((anio) => {
    const p = obtenerParametros(anio);
    return {
      Año: anio,
      'Base Máx. Anual': p.baseMax,
      'SS Empleador %': r2(p.tipoEmpresaTotal * 100),
      'SS Empleado %': r2(p.tipoTrabajadorTotal * 100),
      'MEI Empleador %': r3(p.mei[0] * 100),
      'MEI Empleado %': r3(p.mei[1] * 100),
      'Gastos Fijos Art.19': p.gastosFijos,
      'Mín. Contribuyente': p.irpfMinimo,
      'Mín. Exento Retención': p.minimoExento,
      'Art.20 Umbral Inf': p.art20Meta.uInf,
      'Art.20 Red. Máxima': p.art20Meta.rMax,
      'Art.20 Umbral Sup': p.art20Meta.uSup,
      'Art.20 Red. Mínima': p.art20Meta.rMin,
    };
  });
}

function buildControlTramos(anios: readonly number[]): Record<string, number | string>[] {
  const rows: Record<string, number | string>[] = [];
  for (const anio of anios) {
    const p = obtenerParametros(anio);
    p.tramosIRPF.forEach((tramo, i) => {
      rows.push({
        Año: anio,
        'Nº Tramo': i + 1,
        'Hasta Base': tramo.hasta === Infinity ? 'En adelante' : tramo.hasta,
        'Tipo %': r2(tramo.tipo * 100),
      });
    });
  }
  return rows;
}

function buildComparativaInflacion(anios: readonly number[]): Record<string, number | string>[] {
  const salarios2026: number[] = [];
  for (let s = COMPARATIVA_BRUTO_MIN; s <= COMPARATIVA_BRUTO_MAX; s += COMPARATIVA_BRUTO_STEP) {
    salarios2026.push(s);
  }

  const p2026 = obtenerParametros(2026);
  const ref2026 = new Map<number, Nomina>();
  for (const b of salarios2026) ref2026.set(b, calcularNominaConParametros(b, p2026));

  const rows: Record<string, number | string>[] = [];
  for (const anio of anios) {
    const infAcum = INFLACION_A_2026[anio];
    if (infAcum === undefined) continue;
    const p: Parametros = anio === 2026 ? p2026 : obtenerParametros(anio);

    for (const bruto26 of salarios2026) {
      const brutoNom = bruto26 / infAcum;
      const n = calcularNominaConParametros(brutoNom, p);

      const cLabAj = n.costeLaboral * infAcum;
      const cEmpAj = n.cotSocEmpresa * infAcum;
      const cTraAj = n.cotSocTrabajador * infAcum;
      const irpfAj = n.irpfFinal * infAcum;
      const netoAj = n.salarioNeto * infAcum;

      const ref = ref2026.get(bruto26);
      const neto2026Real = ref?.salarioNeto ?? 0;
      const difPoderAdq = netoAj - neto2026Real;

      rows.push({
        'Año a Comparar': anio,
        'Salario Equivalente (2026)': bruto26,
        'Multiplicador IPC Acum.': roundN(infAcum, 4),
        'IPC Acumulado (%)': `${r2((infAcum - 1) * 100)}%`,
        'Salario Bruto Nominal': r2(brutoNom),
        'Coste Lab. (Euros 2026)': r2(cLabAj),
        'SS Emp. (Euros 2026)': r2(cEmpAj),
        'SS Tra. (Euros 2026)': r2(cTraAj),
        'IRPF (Euros 2026)': r2(irpfAj),
        'Neto Real en su Año': r2(netoAj),
        'Neto Real en 2026': r2(neto2026Real),
        'Variación Poder Adquisitivo Mensual vs 2026 (12 pagas)': r2(difPoderAdq / 12),
        'Pérdida/Ganancia Anual Poder Adq.': r2(difPoderAdq),
      });
    }
  }
  return rows;
}

function buildDatYear(anio: number, maxBruto: number): Record<string, number>[] {
  return calcularAnoCompleto(anio, maxBruto).map(nominaToFila);
}

function appendSheet(wb: WorkBook, name: string, rows: object[]): void {
  const sheet: WorkSheet = utils.json_to_sheet(rows);
  utils.book_append_sheet(wb, sheet, name);
}

export function generarWorkbook(opts: GenerarExcelOptions = {}): WorkBook {
  const anios = opts.anios ?? ANIOS_SOPORTADOS;
  const maxBruto = opts.maxBruto ?? MAX_BRUTO_DEFAULT;
  const wb = utils.book_new();
  appendSheet(wb, 'CONTROL_GENERAL', buildControlGeneral(anios));
  appendSheet(wb, 'CONTROL_TRAMOS_IRPF', buildControlTramos(anios));
  appendSheet(wb, 'COMPARATIVA_INFLACION', buildComparativaInflacion(anios));
  for (const anio of anios) {
    appendSheet(wb, `DAT_${String(anio)}`, buildDatYear(anio, maxBruto));
  }
  return wb;
}

export function generarExcel(outputPath: string, opts: GenerarExcelOptions = {}): void {
  writeFile(generarWorkbook(opts), outputPath);
}

export function generarExcelBlob(opts: GenerarExcelOptions = {}): Blob {
  const wb = generarWorkbook(opts);
  const buffer = write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
