// src/ui/charts/vasos.ts
import { eur, percent } from '../format.js';

export interface VasoTramo {
  readonly idx: number;
  readonly tipo: number;
  readonly hasta: number;
  readonly baseAplicada: number;
  readonly cuota: number;
}

export interface VasosData {
  readonly tramos: readonly VasoTramo[];
  readonly baseImponible: number;
}

/** Proxy width (€) for the open-ended top bracket in the visualisation.
 *  No bruto in the engine's supported range falls into this region; the
 *  value is purely cosmetic. */
const OPEN_BRACKET_WIDTH = 60_000;

function bracketWidth(t: VasoTramo, prev: number): number {
  const top = Number.isFinite(t.hasta) ? t.hasta : prev + OPEN_BRACKET_WIDTH;
  return Math.max(0, top - prev);
}

export function renderVasos(target: HTMLElement, d: VasosData): void {
  let prev = 0;
  const rows = d.tramos
    .map((t) => {
      const widthAvail = bracketWidth(t, prev);
      const fillRatio = widthAvail > 0 ? t.baseAplicada / widthAvail : 0;
      prev = Number.isFinite(t.hasta) ? t.hasta : prev + OPEN_BRACKET_WIDTH;
      const isEmpty = t.cuota <= 0;
      const label = `T${String(t.idx)} · ${percent(t.tipo)}`;
      return `
        <div class="vasos-row${isEmpty ? ' is-empty' : ''}" role="row">
          <div class="v-label" role="rowheader">${label}</div>
          <div class="v-bar" role="cell" aria-label="${isEmpty ? 'tramo vacío' : `${eur(t.baseAplicada)} a ${percent(t.tipo)}`}">
            <div class="v-fill" style="width:${String(Math.min(100, fillRatio * 100))}%;"></div>
          </div>
          <div class="v-amount" role="cell">${isEmpty ? 'vacío' : eur(t.cuota)}</div>
        </div>
      `;
    })
    .join('');

  target.innerHTML = `
    <div class="vasos" role="table" aria-label="Tramos del IRPF: cómo se llenan según tu base imponible. Cuota por tramo.">
      <div class="vasos-head" role="row">
        <div role="columnheader">Tramo</div>
        <div role="columnheader">Base aplicada</div>
        <div role="columnheader">Cuota</div>
      </div>
      ${rows}
    </div>
  `;
}
