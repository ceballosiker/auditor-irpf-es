// Excel exporter (vía SheetJS). Reproduce las pestañas del script Python:
//   CONTROL_GENERAL, CONTROL_TRAMOS_IRPF, COMPARATIVA_INFLACION, DAT_YYYY.

import { utils, writeFile, type WorkBook, type WorkSheet } from 'xlsx';
import { calcularAnoCompleto, MAX_BRUTO_DEFAULT } from './bulk';
import { r2, r3, roundN, tramoLabel } from './format';
import { INFLACION_A_2026 } from './inflacion';
import { obtenerParametros } from './normativa';
import { calcularNomina } from './pipeline';
import type { Nomina, Parametros } from './types';

const ANIO_MIN = 2012;
const ANIO_MAX = 2026;
const ANIOS_DEFAULT = Array.from({ length: ANIO_MAX - ANIO_MIN + 1 }, (_, i) => ANIO_MIN + i);

export interface GenerarExcelOptions {
  /** Años a incluir como pestañas DAT_YYYY. Default: 2012–2026. */
  readonly anios?: readonly number[];
  /** Bruto máximo para las pestañas DAT_YYYY. Default: 100 000 €. */
  readonly maxBruto?: number;
}

function tipoEmpresaTotal(p: Parametros): number {
  return (
    p.ssTipos.comunes[0] +
    p.ssTipos.desempleo[0] +
    p.ssTipos.fogasa[0] +
    p.ssTipos.fp[0] +
    p.ssTipos.atep[0] +
    p.mei[0]
  );
}

function tipoTrabajadorTotal(p: Parametros): number {
  return (
    p.ssTipos.comunes[1] +
    p.ssTipos.desempleo[1] +
    p.ssTipos.fogasa[1] +
    p.ssTipos.fp[1] +
    p.ssTipos.atep[1] +
    p.mei[1]
  );
}

function buildControlGeneral(anios: readonly number[]): Record<string, number | string>[] {
  return anios.map((anio) => {
    const p = obtenerParametros(anio);
    return {
      Año: anio,
      'Base Máx. Anual': p.baseMax,
      'SS Empleador %': r2(tipoEmpresaTotal(p) * 100),
      'SS Empleado %': r2(tipoTrabajadorTotal(p) * 100),
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
  for (let s = 15000; s <= 100000; s += 1000) salarios2026.push(s);

  const ref2026 = new Map<number, Nomina>();
  for (const b of salarios2026) ref2026.set(b, calcularNomina(b, 2026));

  const rows: Record<string, number | string>[] = [];
  for (const anio of anios) {
    const infAcum = INFLACION_A_2026[anio];
    if (infAcum === undefined) continue;

    for (const bruto26 of salarios2026) {
      const brutoNom = bruto26 / infAcum;
      const n = calcularNomina(brutoNom, anio);

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
        'IPC Acumulado (%)': `${String(r2((infAcum - 1) * 100))}%`,
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

function nominaToFila(n: Nomina): Record<string, number> {
  const fila: Record<string, number> = {
    'Salario Bruto': n.bruto,
    'Cot. Soc. Empresa': r2(n.cotSocEmpresa),
    'Coste Laboral': r2(n.costeLaboral),
    'Cot. Soc. Trab.': r2(n.cotSocTrabajador),
    'Ren. Previo': r2(n.renPrevio),
    'Gastos Fijos': n.gastosFijos,
    'Red. Ren. Trab.': r2(n.redRenTrabajo),
    'Base Imponible': r2(n.baseImponible),
  };
  n.cuotasPorTramo.forEach((c, i) => {
    fila[tramoLabel(i, c.tipo)] = r2(c.cuota);
  });
  fila['Cuota Íntegra'] = r2(n.cuotaIntegra);
  fila['Cuota Mínimo Personal'] = r2(n.cuotaMinimoPersonal);
  fila['Cuota Teórica'] = r2(n.cuotaTeorica);
  fila['Deducción SMI'] = r2(n.deduccionSMI);
  fila['Cuota tras SMI'] = r2(n.cuotaTrasSMI);
  fila['Límite 43% (Art 85.3)'] = r2(n.limite43);
  fila['IRPF Final'] = r2(n.irpfFinal);
  fila['Salario Neto'] = r2(n.salarioNeto);
  return fila;
}

function buildDatYear(anio: number, maxBruto: number): Record<string, number>[] {
  return calcularAnoCompleto(anio, maxBruto).map(nominaToFila);
}

function appendSheet(wb: WorkBook, name: string, rows: object[]): void {
  const sheet: WorkSheet = utils.json_to_sheet(rows);
  utils.book_append_sheet(wb, sheet, name);
}

/**
 * Genera el Excel con las pestañas: CONTROL_GENERAL, CONTROL_TRAMOS_IRPF,
 * COMPARATIVA_INFLACION y una DAT_YYYY por año en `opts.anios`.
 *
 * Por defecto: 2012–2026 con brutos 0–100 000 €.
 */
export function generarExcel(outputPath: string, opts: GenerarExcelOptions = {}): void {
  const anios = opts.anios ?? ANIOS_DEFAULT;
  const maxBruto = opts.maxBruto ?? MAX_BRUTO_DEFAULT;
  const wb = utils.book_new();
  appendSheet(wb, 'CONTROL_GENERAL', buildControlGeneral(anios));
  appendSheet(wb, 'CONTROL_TRAMOS_IRPF', buildControlTramos(anios));
  appendSheet(wb, 'COMPARATIVA_INFLACION', buildComparativaInflacion(anios));
  for (const anio of anios) {
    appendSheet(wb, `DAT_${String(anio)}`, buildDatYear(anio, maxBruto));
  }
  writeFile(wb, outputPath);
}
