// src/ui/charts/gap-area.ts
import { eur } from '../format.js';

export interface GapAreaData {
  readonly years: readonly number[];
  readonly gap: readonly number[];
}

export function renderGapArea(target: HTMLElement, d: GapAreaData): void {
  const W = 700,
    H = 240,
    PAD_L = 50,
    PAD_R = 20,
    PAD_T = 30,
    PAD_B = 40;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xMin = d.years[0] ?? 2012;
  const xMax = d.years[d.years.length - 1] ?? 2026;
  const xSpan = Math.max(1, xMax - xMin);
  const yMax = Math.max(1, ...d.gap.map(Math.abs));
  const yScale = (v: number): number => PAD_T + innerH - (Math.abs(v) / yMax) * innerH;
  const xScale = (y: number): number => PAD_L + ((y - xMin) / xSpan) * innerW;

  const points = d.years
    .map((y, i) => `${String(xScale(y))},${String(yScale(d.gap[i] ?? 0))}`)
    .join(' ');

  const areaPath =
    `M${String(xScale(xMin))},${String(yScale(0))} ` +
    d.years.map((y, i) => `L${String(xScale(y))},${String(yScale(d.gap[i] ?? 0))}`).join(' ') +
    ` L${String(xScale(xMax))},${String(yScale(0))} Z`;

  const gapHoy = d.gap[d.gap.length - 1] ?? 0;

  const xLast = xScale(xMax);
  const yLast = yScale(gapHoy);

  const sign = gapHoy >= 0 ? '+' : '−';
  const headlineNum = `${sign}${eur(Math.abs(gapHoy))}`;

  const srRows = d.years
    .map((y, i) => `<tr><th scope="row">${String(y)}</th><td>${eur(d.gap[i] ?? 0)}</td></tr>`)
    .join('');

  target.innerHTML = `
    <svg viewBox="0 0 ${String(W)} ${String(H)}" role="img" aria-labelledby="gap-title gap-desc" style="width:100%;height:auto;">
      <title id="gap-title">Brecha acumulada de poder adquisitivo entre 2012 y ${String(xMax)}, en euros constantes de 2026</title>
      <desc id="gap-desc">${headlineNum} en el último año.</desc>
      <line x1="${String(PAD_L)}" y1="${String(PAD_T + innerH)}" x2="${String(W - PAD_R)}" y2="${String(PAD_T + innerH)}" stroke="var(--ink)"/>
      <line x1="${String(PAD_L)}" y1="${String(PAD_T)}" x2="${String(PAD_L)}" y2="${String(PAD_T + innerH)}" stroke="var(--ink)"/>
      <text x="${String(PAD_L)}" y="${String(PAD_T + innerH + 18)}" font-size="11" fill="var(--ink-mute)">${String(xMin)}</text>
      <text x="${String(W - PAD_R)}" y="${String(PAD_T + innerH + 18)}" font-size="11" fill="var(--ink-mute)" text-anchor="end">${String(xMax)}</text>
      <path class="gap-area" d="${areaPath}" fill="var(--accent)" opacity="0.16"/>
      <polyline class="gap-line" points="${points}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
      <circle class="gap-endpoint" cx="${String(xLast)}" cy="${String(yLast)}" r="5" fill="var(--accent)"/>
      <text x="${String(xLast - 10)}" y="${String(yLast - 12)}" font-size="14" font-family="var(--font-display)" font-weight="700" fill="var(--ink)" text-anchor="end">${headlineNum}</text>
    </svg>
    <table class="sr-only">
      <caption>Brecha acumulada de poder adquisitivo año a año (€ de 2026)</caption>
      <thead><tr><th scope="col">Año</th><th scope="col">Gap</th></tr></thead>
      <tbody>${srRows}</tbody>
    </table>
  `;
}
