import { calcularNomina, obtenerParametros } from '../index.js';
import type { Nomina, Parametros } from '../index.js';
import { eur, percent } from './format.js';
import { render } from './render.js';

interface Breakdown {
  readonly baseCotizacion: number;
  readonly topeAlcanzado: boolean;
  readonly meiTrabajador: number;
  readonly solidaridadTrabajador: number;
  readonly tope43Aplica: boolean;
}

function breakdown(nomina: Nomina, p: Parametros): Breakdown {
  const baseCotizacion = Math.min(nomina.bruto, p.baseMax);
  const meiTrabajador = baseCotizacion * p.mei[1];
  const solidaridadTrabajador = nomina.cotSocTrabajador - baseCotizacion * p.tipoTrabajadorTotal;
  return {
    baseCotizacion,
    topeAlcanzado: nomina.bruto > p.baseMax,
    meiTrabajador,
    solidaridadTrabajador: Math.max(0, solidaridadTrabajador),
    tope43Aplica: nomina.cuotaTrasSMI > nomina.limite43 + 1e-6,
  };
}

function row(label: string, value: string, hint?: string): string {
  const hintHtml = hint ? `<br><small>${hint}</small>` : '';
  return `<tr><th scope="row">${label}${hintHtml}</th><td>${value}</td></tr>`;
}

function tramosTable(nomina: Nomina): string {
  const activos = nomina.cuotasPorTramo
    .map((t, i) => ({ ...t, idx: i + 1 }))
    .filter((t) => t.cuota > 0);

  if (activos.length === 0) {
    return `<p><em>Sin cuota a pagar en ningún tramo (base imponible nula o cubierta por el mínimo personal).</em></p>`;
  }

  const rows = activos
    .map((t) => {
      const baseAplicada = t.tipo > 0 ? t.cuota / t.tipo : 0;
      return `
        <tr>
          <td>T${String(t.idx)}</td>
          <td>${percent(t.tipo)}</td>
          <td>${eur(baseAplicada)}</td>
          <td>${eur(t.cuota)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <table>
      <thead>
        <tr><th>Tramo</th><th>Tipo</th><th>Base aplicada</th><th>Cuota</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function renderResults(target: HTMLElement, bruto: number, anio: number): void {
  const params = obtenerParametros(anio);
  const nomina = calcularNomina(bruto, anio);
  const b = breakdown(nomina, params);

  const netoMensual = nomina.salarioNeto / 14;

  const cotizacionRows = [
    row('Bruto anual', eur(nomina.bruto)),
    row(
      'Base de cotización',
      `${eur(b.baseCotizacion)}${b.topeAlcanzado ? ' <mark>tope alcanzado</mark>' : ''}`,
      b.topeAlcanzado
        ? `Bruto excede el tope (${eur(params.baseMax)}); el exceso solo cotiza por Solidaridad.`
        : undefined,
    ),
    row('Cotización empresa', eur(nomina.cotSocEmpresa)),
    row('Cotización trabajador', eur(nomina.cotSocTrabajador)),
    ...(b.meiTrabajador > 0 ? [row('— de la cual, MEI trabajador', eur(b.meiTrabajador))] : []),
    ...(b.solidaridadTrabajador > 0
      ? [row('— de la cual, Solidaridad trabajador', eur(b.solidaridadTrabajador))]
      : []),
    row('Coste laboral total', eur(nomina.costeLaboral)),
  ].join('');

  const irpfRows = [
    row('Rendimiento previo (bruto − cot. trabajador)', eur(nomina.renPrevio)),
    row('Reducción Art. 20 (rendimientos del trabajo)', eur(nomina.redRenTrabajo)),
    row('Gastos fijos Art. 19', eur(nomina.gastosFijos)),
    row('Base imponible', eur(nomina.baseImponible)),
    row('Cuota íntegra (suma tramos)', eur(nomina.cuotaIntegra)),
    row(
      'Cuota mínimo personal',
      eur(nomina.cuotaMinimoPersonal),
      `Mínimo aplicado al tipo del primer tramo (${percent(params.tramosIRPF[0]?.tipo ?? 0)}).`,
    ),
    row('Cuota teórica (íntegra − mínimo)', eur(nomina.cuotaTeorica)),
    ...(nomina.deduccionSMI > 0 ? [row('Deducción SMI', eur(nomina.deduccionSMI))] : []),
    row('Cuota tras SMI', eur(nomina.cuotaTrasSMI)),
    row(
      'Tope 43 % sobre (bruto − mínimo exento)',
      `${eur(nomina.limite43)} <small>(${b.tope43Aplica ? 'aplica' : 'no aplica'})</small>`,
      b.tope43Aplica
        ? `La cuota teórica supera el tope; el IRPF final se recorta a ${eur(nomina.limite43)}.`
        : undefined,
    ),
    row('IRPF final', `<strong>${eur(nomina.irpfFinal)}</strong>`),
  ].join('');

  render(
    target,
    `
      <article>
        <header><strong>Cotización social</strong></header>
        <table>${cotizacionRows}</table>
      </article>

      <article>
        <header><strong>IRPF</strong></header>
        <table>${irpfRows}</table>
        <h6>Tramos aplicados</h6>
        ${tramosTable(nomina)}
      </article>

      <article>
        <header><strong>Resultado: salario neto</strong></header>
        <table>
          ${row('Neto anual', `<strong>${eur(nomina.salarioNeto)}</strong>`)}
          ${row('Neto mensual (×14 pagas)', `<strong>${eur(netoMensual)}</strong>`)}
        </table>
      </article>
    `,
  );
}
