// src/ui/sections/breakdown.ts
import { calcularNominaConParametros, obtenerParametros } from '../../index.js';
import type { Nomina, Parametros } from '../../index.js';
import { renderStackedBar } from '../charts/stacked-bar.js';
import { eur } from '../intl.js';
import { render } from '../render.js';

interface State {
  readonly bruto: number;
  readonly anio: number;
}

export function mountBreakdown(target: HTMLElement): void {
  render(
    target,
    `
    <section>
      <div class="eyebrow">¿Adónde va el resto?</div>
      <h2 data-h>De cada 100 € de tu bruto, te quedas con —.</h2>
      <p>Antes de llegar a tu cuenta, tu bruto pasa por dos cobros: la cotización social, que paga el sistema público, y el IRPF, que paga el Estado. Lo que queda es tu neto.</p>
      <div data-chart="stacked-bar"></div>
      <a class="read-more" href="./manual/motor/01-cotizacion/">Si quieres profundizar: cómo funciona la cotización social →</a>
      <details id="drill-cotizacion">
        <summary>Ver el cálculo paso a paso (MEI, Solidaridad, base de cotización)</summary>
        <div data-drill="cotizacion"></div>
      </details>
    </section>
  `,
  );
}

function row(label: string, value: string, hint?: string): string {
  const h = hint ? `<br><small>${hint}</small>` : '';
  return `<tr><th scope="row">${label}${h}</th><td>${value}</td></tr>`;
}

function drillTable(n: Nomina, p: Parametros): string {
  const baseCotizacion = Math.min(n.bruto, p.baseMax);
  const tope = n.topeAlcanzado;
  const meiTrabajador = n.meiTrabajador;
  const solidaridadTrabajador = n.solidaridadTrabajador;
  const rows = [
    row('Bruto anual', eur(n.bruto)),
    row(
      'Base de cotización',
      `${eur(baseCotizacion)}${tope ? ' <mark>tope alcanzado</mark>' : ''}`,
      tope
        ? `Bruto excede el tope (${eur(p.baseMax)}); el exceso solo cotiza por Solidaridad.`
        : undefined,
    ),
    row('Cotización empresa', eur(n.cotSocEmpresa)),
    row('Cotización trabajador', eur(n.cotSocTrabajador)),
    ...(meiTrabajador > 0 ? [row('— de la cual, MEI trabajador', eur(meiTrabajador))] : []),
    ...(solidaridadTrabajador > 0
      ? [row('— de la cual, Solidaridad trabajador', eur(solidaridadTrabajador))]
      : []),
    row('Coste laboral total', eur(n.costeLaboral)),
  ].join('');
  return `<table class="drill-table">${rows}</table>`;
}

export function updateBreakdown(target: HTMLElement, state: State): void {
  const params = obtenerParametros(state.anio);
  const nomina = calcularNominaConParametros(state.bruto, params);
  const total = state.bruto > 0 ? state.bruto : 1;
  const pNeto = (nomina.salarioNeto / total) * 100;
  const h = target.querySelector('[data-h]');
  if (h) h.textContent = `De cada 100 € de tu bruto, te quedas con ${pNeto.toFixed(1)} €.`;

  const chartHost = target.querySelector<HTMLElement>('[data-chart="stacked-bar"]');
  if (chartHost) {
    renderStackedBar(chartHost, {
      bruto: nomina.bruto,
      neto: nomina.salarioNeto,
      irpf: nomina.irpfFinal,
      cotSocTrabajador: nomina.cotSocTrabajador,
    });
  }
  const drill = target.querySelector<HTMLElement>('[data-drill="cotizacion"]');
  if (drill) drill.innerHTML = drillTable(nomina, params);
}
