// Pipeline de cálculo de nómina española.
//
// Orden del cálculo (debe respetarse: cada paso depende del anterior):
//   1. Base de cotización (con tope `baseMax`).
//   2. Cotizaciones SS empresa + trabajador, más MEI sobre la misma base.
//   3. Cuota de Solidaridad sobre el exceso (si aplica), repartida 5/6 - 1/6.
//   4. Rendimiento previo = bruto - cot_trabajador.
//   5. Reducción Art. 20 sobre el rendimiento previo (antes de gastos Art. 19).
//   6. Base imponible = max(0, rn_previo - gastos_fijos - reducción Art. 20).
//   7. Cuotas por tramo IRPF (escala progresiva).
//   8. Mínimo personal aplicado como cuota (al tipo del primer tramo).
//   9. Deducción SMI (2025+).
//  10. Tope del 43 % sobre (bruto - mínimo exento) — Art. 85.3 RIRPF.
//  11. IRPF final = min(cuota tras deducciones, tope 43 %).

import { obtenerParametros } from './normativa';
import type { CuotaTramo, Nomina, Parametros, TramoIRPF } from './types';

const TIPO_43 = 0.43;
const REPARTO_SOLIDARIDAD_EMPRESA = 5 / 6;
const REPARTO_SOLIDARIDAD_TRABAJADOR = 1 / 6;
const SOLIDARIDAD_BANDA_1 = 0.1;
const SOLIDARIDAD_BANDA_2 = 0.5;

interface CuotaSolidaridad {
  empresa: number;
  trabajador: number;
}

function cuotaSolidaridad(excesoBase: number, p: Parametros): CuotaSolidaridad {
  if (p.solidaridad.length === 0 || excesoBase <= 0) {
    return { empresa: 0, trabajador: 0 };
  }
  const tramo1Limite = p.baseMax * SOLIDARIDAD_BANDA_1;
  const tramo2Limite = p.baseMax * SOLIDARIDAD_BANDA_2;
  const exceso1 = Math.min(excesoBase, tramo1Limite);
  const exceso2 = Math.min(Math.max(0, excesoBase - tramo1Limite), tramo2Limite - tramo1Limite);
  const exceso3 = Math.max(0, excesoBase - tramo2Limite);
  const tipo1 = p.solidaridad[0]?.tipo ?? 0;
  const tipo2 = p.solidaridad[1]?.tipo ?? 0;
  const tipo3 = p.solidaridad[2]?.tipo ?? 0;
  const cuotaTotal = exceso1 * tipo1 + exceso2 * tipo2 + exceso3 * tipo3;
  return {
    empresa: cuotaTotal * REPARTO_SOLIDARIDAD_EMPRESA,
    trabajador: cuotaTotal * REPARTO_SOLIDARIDAD_TRABAJADOR,
  };
}

function calcularCuotasPorTramo(
  baseLiq: number,
  tramos: readonly TramoIRPF[],
): { cuotas: CuotaTramo[]; total: number } {
  const cuotas: CuotaTramo[] = tramos.map((t) => ({ tipo: t.tipo, cuota: 0 }));
  if (baseLiq <= 0) return { cuotas, total: 0 };
  let total = 0;
  let limAnt = 0;
  for (const [i, t] of tramos.entries()) {
    if (baseLiq > t.hasta) {
      const cuota = (t.hasta - limAnt) * t.tipo;
      cuotas[i] = { tipo: t.tipo, cuota };
      total += cuota;
      limAnt = t.hasta;
    } else {
      const cuota = (baseLiq - limAnt) * t.tipo;
      cuotas[i] = { tipo: t.tipo, cuota };
      total += cuota;
      break;
    }
  }
  return { cuotas, total };
}

/**
 * Variante de `calcularNomina` que toma `Parametros` ya resueltos. Diseñada
 * para que llamadores en bucle (Excel, comparativa) hoisten `obtenerParametros`
 * fuera del bucle interno y eviten reconstruir cierres y objetos por bruto.
 */
export function calcularNominaConParametros(bruto: number, p: Parametros): Nomina {
  const baseCotizacion = Math.min(bruto, p.baseMax);
  const excesoBase = Math.max(0, bruto - p.baseMax);

  let cotEmpresa = baseCotizacion * p.tipoEmpresaTotal;
  let cotTrabajador = baseCotizacion * p.tipoTrabajadorTotal;

  const sol = cuotaSolidaridad(excesoBase, p);
  cotEmpresa += sol.empresa;
  cotTrabajador += sol.trabajador;

  const costeLaboral = bruto + cotEmpresa;

  const renPrevio = bruto - cotTrabajador;
  const redRenTrabajo = p.reduccionTrabajo(renPrevio);
  const renNeto = Math.max(0, renPrevio - p.gastosFijos);
  const baseImponible = Math.max(0, renNeto - redRenTrabajo);

  const { cuotas, total: cuotaIntegra } = calcularCuotasPorTramo(baseImponible, p.tramosIRPF);
  const tipoPrimerTramo = p.tramosIRPF[0]?.tipo ?? 0;
  const cuotaMinimoPersonal = p.irpfMinimo * tipoPrimerTramo;
  const cuotaTeorica = Math.max(0, cuotaIntegra - cuotaMinimoPersonal);

  const deduccionSMIVal = p.deduccionSMI(bruto);
  const cuotaTrasSMI = Math.max(0, cuotaTeorica - deduccionSMIVal);

  const limite43 = Math.max(0, (bruto - p.minimoExento) * TIPO_43);
  const irpfFinal = Math.min(cuotaTrasSMI, limite43);
  const salarioNeto = bruto - cotTrabajador - irpfFinal;

  return {
    bruto,
    anio: p.anio,
    cotSocEmpresa: cotEmpresa,
    costeLaboral,
    cotSocTrabajador: cotTrabajador,
    renPrevio,
    gastosFijos: p.gastosFijos,
    redRenTrabajo,
    baseImponible,
    cuotasPorTramo: cuotas,
    cuotaIntegra,
    cuotaMinimoPersonal,
    cuotaTeorica,
    deduccionSMI: deduccionSMIVal,
    cuotaTrasSMI,
    limite43,
    irpfFinal,
    salarioNeto,
  };
}

/**
 * Calcula la nómina anual para un salario bruto. Función pura: el resultado
 * sólo depende de `(bruto, anio)`. Lanza si `anio` está fuera de [2012, 2026].
 */
export function calcularNomina(bruto: number, anio: number): Nomina {
  return calcularNominaConParametros(bruto, obtenerParametros(anio));
}
