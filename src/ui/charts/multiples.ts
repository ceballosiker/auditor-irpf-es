// src/ui/charts/multiples.ts
import { eur, percent } from '../intl.js';

export interface MultiplesData {
  readonly years: readonly number[];
  readonly netoReal: readonly number[];
  readonly irpfReal: readonly number[];
  readonly tipoEfectivo: readonly number[];
  readonly ssReal: readonly number[];
}

interface Series {
  readonly id: string; // ASCII-safe HTML id (no spaces, no special chars)
  readonly label: string; // Display label (rich text OK)
  readonly values: readonly number[];
  readonly format: (v: number) => string;
}

function renderOne(s: Series, years: readonly number[]): string {
  const W = 220,
    H = 110;
  const PAD_L = 44,
    PAD_R = 10,
    PAD_T = 10,
    PAD_B = 18;
  const yMin = Math.min(...s.values);
  const yMax = Math.max(...s.values);
  const span = Math.max(1e-6, yMax - yMin);
  const xMin = years[0] ?? 0;
  const xMax = years[years.length - 1] ?? 0;
  const xSpan = Math.max(1, xMax - xMin);
  const x = (year: number): number => PAD_L + ((year - xMin) / xSpan) * (W - PAD_L - PAD_R);
  const y = (v: number): number => H - PAD_B - ((v - yMin) / span) * (H - PAD_T - PAD_B);
  const points = years.map((yr, i) => `${String(x(yr))},${String(y(s.values[i] ?? 0))}`).join(' ');
  const first = s.values[0] ?? 0;
  const last = s.values[s.values.length - 1] ?? 0;
  const titleId = `${s.id}-t`;
  const yMaxLabel = s.format(yMax);
  const yMinLabel = s.format(yMin);
  const axisAttrs = 'font-size="9" fill="var(--ink-mute)"';

  return `
    <div class="multi-cell">
      <div class="multi-label">${s.label}</div>
      <div class="multi-meta">${String(xMin)}: ${s.format(first)} → ${String(xMax)}: ${s.format(last)}</div>
      <svg class="multi" viewBox="0 0 ${String(W)} ${String(H)}" role="img" aria-labelledby="${titleId}" style="width:100%;height:auto;">
        <title id="${titleId}">${s.label} entre ${String(xMin)} y ${String(xMax)}</title>
        <text class="multi-axis multi-axis-y" x="${String(PAD_L - 4)}" y="${String(PAD_T + 3)}" text-anchor="end" ${axisAttrs}>${yMaxLabel}</text>
        <text class="multi-axis multi-axis-y" x="${String(PAD_L - 4)}" y="${String(H - PAD_B + 1)}" text-anchor="end" ${axisAttrs}>${yMinLabel}</text>
        <text class="multi-axis multi-axis-x" x="${String(PAD_L)}" y="${String(H - 4)}" text-anchor="start" ${axisAttrs}>${String(xMin)}</text>
        <text class="multi-axis multi-axis-x" x="${String(W - PAD_R)}" y="${String(H - 4)}" text-anchor="end" ${axisAttrs}>${String(xMax)}</text>
        <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="1.8"/>
      </svg>
    </div>
  `;
}

export function renderMultiples(target: HTMLElement, d: MultiplesData): void {
  const series: Series[] = [
    { id: 'multi-neto-real', label: 'Neto real (€ 2026)', values: d.netoReal, format: eur },
    { id: 'multi-irpf-real', label: 'IRPF real (€ 2026)', values: d.irpfReal, format: eur },
    {
      id: 'multi-tipo-efect',
      label: 'Tipo efectivo IRPF',
      values: d.tipoEfectivo,
      format: percent,
    },
    { id: 'multi-ss-real', label: 'Cotización SS (€ 2026)', values: d.ssReal, format: eur },
  ];

  const srRows = d.years
    .map((y, i) => {
      const cells = series.map((s) => `<td>${s.format(s.values[i] ?? 0)}</td>`).join('');
      return `<tr><th scope="row">${String(y)}</th>${cells}</tr>`;
    })
    .join('');
  const srHead = series.map((s) => `<th scope="col">${s.label}</th>`).join('');

  target.innerHTML = `
    <div class="multiples">${series.map((s) => renderOne(s, d.years)).join('')}</div>
    <table class="sr-only">
      <caption>Indicadores año a año entre ${String(d.years[0] ?? '')} y ${String(d.years[d.years.length - 1] ?? '')}</caption>
      <thead><tr><th scope="col">Año</th>${srHead}</tr></thead>
      <tbody>${srRows}</tbody>
    </table>
  `;
}
