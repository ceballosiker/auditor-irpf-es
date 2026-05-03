// src/ui/sections/history.ts
import { calcularNominaConParametros, obtenerParametros } from '../../index.js';
import { INFLACION_A_2026 } from '../../inflacion.js';
import { ANIO_MIN, ANIO_MAX } from '../../normativa.js';
import { renderGapArea } from '../charts/gap-area.js';
import { renderMultiples } from '../charts/multiples.js';
import { eur } from '../format.js';
import { gapSeries } from '../history-data.js';
import { render } from '../render.js';

interface State { readonly bruto: number; readonly anio: number; }

export function mountHistory(target: HTMLElement): void {
  render(
    target,
    `
    <section style="background: var(--paper-deep);">
      <div class="eyebrow">¿Qué ha cambiado entre 2012 y ${String(ANIO_MAX)}?</div>
      <h2 data-h>—</h2>
      <p>Manteniendo tu poder adquisitivo constante en euros de ${String(ANIO_MAX)}, este es el coste acumulado de la «progresividad en frío» — los tramos no se han actualizado al ritmo de la inflación.</p>
      <div data-chart="gap-area"></div>
      <a class="read-more" href="/manual/progresividad-en-frio/">Si quieres profundizar: progresividad en frío →</a>
      <details id="drill-multiples">
        <summary>Ver pequeños múltiples (neto, IRPF, tipo efectivo, SS año a año)</summary>
        <div data-drill="multiples"></div>
      </details>
    </section>
  `,
  );
}

function headline(gapHoy: number): string {
  if (gapHoy > 100)  return `Si la fiscalidad de 2012 hubiera seguido vigente, hoy tendrías ${eur(gapHoy)} más en el bolsillo.`;
  if (gapHoy < -100) return `Si la fiscalidad de 2012 hubiera seguido vigente, hoy tendrías ${eur(Math.abs(gapHoy))} menos: las reformas posteriores a 2012 te benefician en este caso.`;
  return `Tu neto real es prácticamente equivalente al que tendrías bajo una fiscalidad indexada a 2012.`;
}

export function updateHistory(target: HTMLElement, state: State): void {
  const series = gapSeries(state.bruto);
  const h = target.querySelector('[data-h]');
  if (h) h.textContent = headline(series.gapHoy);

  const gapHost = target.querySelector<HTMLElement>('[data-chart="gap-area"]');
  if (gapHost) renderGapArea(gapHost, { years: series.years, gap: series.gap });

  const irpfReal:     number[] = [];
  const tipoEfectivo: number[] = [];
  const ssReal:       number[] = [];
  for (let a = ANIO_MIN; a <= ANIO_MAX; a++) {
    const mult = INFLACION_A_2026[a];
    if (mult === undefined) {
      throw new Error(`No INFLACION_A_2026 entry for year ${String(a)}`);
    }
    const brutoNominal = state.bruto / mult;
    const params = obtenerParametros(a);
    const n = calcularNominaConParametros(brutoNominal, params);
    irpfReal.push(n.irpfFinal * mult);
    ssReal.push(n.cotSocTrabajador * mult);
    tipoEfectivo.push(brutoNominal > 0 ? n.irpfFinal / brutoNominal : 0);
  }

  const drill = target.querySelector<HTMLElement>('[data-drill="multiples"]');
  if (drill) {
    renderMultiples(drill, {
      years: series.years,
      netoReal: series.netoRealActual,
      irpfReal,
      tipoEfectivo,
      ssReal,
    });
  }
}
