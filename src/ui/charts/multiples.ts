// src/ui/charts/multiples.ts
import { eur, percent } from '../format.js';

export interface MultiplesData {
  readonly years: readonly number[];
  readonly netoReal: readonly number[];
  readonly irpfReal: readonly number[];
  readonly tipoEfectivo: readonly number[];
  readonly ssReal: readonly number[];
}

interface Series {
  readonly label: string;
  readonly values: readonly number[];
  readonly format: (v: number) => string;
}

function renderOne(s: Series, years: readonly number[]): string {
  const W = 220, H = 110, PAD = 12;
  const yMin = Math.min(...s.values);
  const yMax = Math.max(...s.values);
  const span = Math.max(1e-6, yMax - yMin);
  const xMin = years[0] ?? 0;
  const xSpan = Math.max(1, (years[years.length - 1] ?? 0) - xMin);
  const x = (year: number): number => PAD + ((year - xMin) / xSpan) * (W - 2 * PAD);
  const y = (v: number): number => H - PAD - ((v - yMin) / span) * (H - 2 * PAD);
  const points = years.map((yr, i) => `${String(x(yr))},${String(y(s.values[i] ?? 0))}`).join(' ');
  const first = s.values[0] ?? 0;
  const last  = s.values[s.values.length - 1] ?? 0;

  return `
    <div class="multi-cell">
      <div class="multi-label">${s.label}</div>
      <div class="multi-meta">${String(years[0] ?? '')}: ${s.format(first)} → ${String(years[years.length - 1] ?? '')}: ${s.format(last)}</div>
      <svg class="multi" viewBox="0 0 ${String(W)} ${String(H)}" role="img" aria-labelledby="multi-${s.label.replace(/\s+/g, '-')}-t" style="width:100%;height:auto;">
        <title id="multi-${s.label.replace(/\s+/g, '-')}-t">${s.label} entre ${String(years[0] ?? '')} y ${String(years[years.length - 1] ?? '')}</title>
        <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="1.8"/>
      </svg>
    </div>
  `;
}

export function renderMultiples(target: HTMLElement, d: MultiplesData): void {
  const series: Series[] = [
    { label: 'Neto real (€ 2026)',    values: d.netoReal,    format: eur },
    { label: 'IRPF real (€ 2026)',    values: d.irpfReal,    format: eur },
    { label: 'Tipo efectivo IRPF',    values: d.tipoEfectivo, format: percent },
    { label: 'Cotización SS (€ 2026)', values: d.ssReal,     format: eur },
  ];
  target.innerHTML = `<div class="multiples">${series.map((s) => renderOne(s, d.years)).join('')}</div>`;
}
