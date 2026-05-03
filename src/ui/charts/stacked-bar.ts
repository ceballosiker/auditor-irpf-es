// src/ui/charts/stacked-bar.ts
import { eur, percent } from '../format.js';

export interface StackedBarData {
  readonly bruto: number;
  readonly neto: number;
  readonly irpf: number;
  readonly cotSocTrabajador: number;
}

export function renderStackedBar(target: HTMLElement, d: StackedBarData): void {
  // 100×32 viewBox; rect widths are percentages of bruto, so the bar
  // stretches to fill its container at any width via preserveAspectRatio="none".
  const total = Number.isFinite(d.bruto) && d.bruto > 0 ? d.bruto : 1;
  const clamp = (v: number): number => Math.max(0, Math.min(100, v));
  const pNeto = clamp((d.neto / total) * 100);
  const pIrpf = clamp((d.irpf / total) * 100);
  const pSS = clamp((d.cotSocTrabajador / total) * 100);
  const xNeto = 0;
  const xIrpf = pNeto;
  const xSS = pNeto + pIrpf;

  target.innerHTML = `
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" role="img" aria-labelledby="sb-title sb-desc" style="width:100%;height:56px;">
      <title id="sb-title">Distribución del salario bruto entre neto, IRPF y cotización social</title>
      <desc id="sb-desc">Tu bruto de ${eur(d.bruto)} se reparte: ${eur(d.neto)} neto, ${eur(d.irpf)} IRPF, ${eur(d.cotSocTrabajador)} cotización social.</desc>
      <rect class="segment" x="${String(xNeto)}" y="0" width="${String(pNeto)}" height="32" fill="var(--neto)"/>
      <rect class="segment" x="${String(xIrpf)}" y="0" width="${String(pIrpf)}" height="32" fill="var(--accent)"/>
      <rect class="segment" x="${String(xSS)}"   y="0" width="${String(pSS)}"   height="32" fill="var(--ss)"/>
    </svg>
    <div class="sb-key" aria-hidden="true" style="display:flex; gap:18px; margin-top:12px; font-size:0.78rem; color:var(--ink-mute);">
      <span><span style="color:var(--neto);">■</span> Neto ${eur(d.neto)} (${percent(d.neto / total)})</span>
      <span><span style="color:var(--accent);">■</span> IRPF ${eur(d.irpf)} (${percent(d.irpf / total)})</span>
      <span><span style="color:var(--ss);">■</span> SS ${eur(d.cotSocTrabajador)} (${percent(d.cotSocTrabajador / total)})</span>
    </div>
  `;
}
