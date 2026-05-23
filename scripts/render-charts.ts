// Render SVG charts for the manual.
//
// Output: docs/assets/<slug>.svg, one per chart referenced in
// docs/progresividad-en-frio.md.
//
// Run: `npm run charts` (from repo root). Idempotent.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { calcularNomina } from '../src/pipeline';
import { INFLACION_A_2026 } from '../src/inflacion';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(REPO_ROOT, 'docs', 'assets');

// Paleta de series tab10-derivada, ajustada para alcanzar ≥ 3:1 sobre `bg`
// (WCAG 2.1 SC 1.4.11, non-text contrast). Los valores originales
// (#ff7f0e ≈ 2.29:1, #17becf ≈ 2.04:1) no eran perceivables sobre la paleta
// editorial cálida.
export const PALETTE_LIGHT = {
  bg: '#f7f3ec',
  axis: '#333333',
  grid: '#e5e5e5',
  text: '#444444',
  title: '#222222',
  series: ['#1f77b4', '#d62728', '#2ca02c', '#9467bd', '#cc6600', '#00838f'] as const,
} as const;

export const PALETTE_DARK = {
  bg: '#1a1612',
  axis: '#f3ede2',
  grid: '#3a342c',
  text: '#d4cdbf',
  title: '#f3ede2',
  series: ['#5d9ec9', '#e87073', '#66bf66', '#b89bd6', '#ffaa57', '#71d6e0'] as const,
} as const;

interface Series {
  label: string;
  points: [number, number][];
}

interface ChartSpec {
  slug: string;
  title: string;
  xLabel: string;
  yLabel: string;
  xFormat: (v: number) => string;
  yFormat: (v: number) => string;
  series: Series[];
  desc: string;
  width?: number;
  height?: number;
}

const linearScale =
  (d0: number, d1: number, r0: number, r1: number) =>
  (v: number): number =>
    r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

function niceTicks(min: number, max: number, count = 6): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const rough = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step: number;
  if (norm < 1.5) step = mag;
  else if (norm < 3) step = 2 * mag;
  else if (norm < 7) step = 5 * mag;
  else step = 10 * mag;
  const start = Math.ceil(min / step) * step;
  const out: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) {
    out.push(Number(v.toFixed(10)));
  }
  return out;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface ChartPalette {
  bg: string;
  axis: string;
  grid: string;
  text: string;
  title: string;
  series: readonly string[];
}

function paletteStyleBlock(): string {
  const L: ChartPalette = PALETTE_LIGHT;
  const D: ChartPalette = PALETTE_DARK;
  const seriesVars = (p: ChartPalette, indent: string): string =>
    p.series.map((c, i) => `${indent}--c-s${String(i)}: ${c};`).join('\n');
  return [
    '<style>',
    '  :root {',
    `    --c-bg: ${L.bg};`,
    `    --c-axis: ${L.axis};`,
    `    --c-grid: ${L.grid};`,
    `    --c-text: ${L.text};`,
    `    --c-title: ${L.title};`,
    seriesVars(L, '    '),
    '  }',
    '  @media (prefers-color-scheme: dark) {',
    '    :root {',
    `      --c-bg: ${D.bg};`,
    `      --c-axis: ${D.axis};`,
    `      --c-grid: ${D.grid};`,
    `      --c-text: ${D.text};`,
    `      --c-title: ${D.title};`,
    seriesVars(D, '      '),
    '    }',
    '  }',
    '</style>',
  ].join('\n');
}

function renderChart(spec: ChartSpec): string {
  const W = spec.width ?? 760;
  const H = spec.height ?? 420;
  const M = { top: 60, right: 170, bottom: 60, left: 80 };
  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;

  const allX = spec.series.flatMap((s) => s.points.map((p) => p[0]));
  const allY = spec.series.flatMap((s) => s.points.map((p) => p[1]));
  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);
  const yMinRaw = Math.min(...allY);
  const yMaxRaw = Math.max(...allY);
  const yPad = (yMaxRaw - yMinRaw) * 0.05;
  const yMin = Math.max(0, yMinRaw - yPad);
  const yMax = yMaxRaw + yPad;

  const x = linearScale(xMin, xMax, 0, innerW);
  const y = linearScale(yMin, yMax, innerH, 0);

  const xTicks = niceTicks(xMin, xMax, 8);
  const yTicks = niceTicks(yMin, yMax, 6);

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${String(W)} ${String(H)}" width="${String(W)}" height="${String(H)}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" role="img" aria-labelledby="${spec.slug}-title ${spec.slug}-desc">`,
  );
  parts.push(`<title id="${spec.slug}-title">${escapeXml(spec.title)}</title>`);
  parts.push(`<desc id="${spec.slug}-desc">${escapeXml(spec.desc)}</desc>`);
  parts.push(paletteStyleBlock());
  parts.push(`<rect width="${String(W)}" height="${String(H)}" fill="var(--c-bg)" />`);

  parts.push(
    `<text x="${String(M.left)}" y="${String(M.top - 25)}" font-size="16" font-weight="600" fill="var(--c-title)">${escapeXml(spec.title)}</text>`,
  );

  parts.push(`<g transform="translate(${String(M.left)},${String(M.top)})">`);

  for (const t of yTicks) {
    const yp = y(t);
    parts.push(
      `<line x1="0" y1="${yp.toFixed(2)}" x2="${String(innerW)}" y2="${yp.toFixed(2)}" stroke="var(--c-grid)" stroke-width="1" />`,
    );
  }

  parts.push(
    `<line x1="0" y1="${String(innerH)}" x2="${String(innerW)}" y2="${String(innerH)}" stroke="var(--c-axis)" stroke-width="1" />`,
  );
  parts.push(
    `<line x1="0" y1="0" x2="0" y2="${String(innerH)}" stroke="var(--c-axis)" stroke-width="1" />`,
  );

  for (const t of xTicks) {
    const xp = x(t);
    parts.push(
      `<line x1="${xp.toFixed(2)}" y1="${String(innerH)}" x2="${xp.toFixed(2)}" y2="${String(innerH + 5)}" stroke="var(--c-axis)" stroke-width="1" />`,
    );
    parts.push(
      `<text x="${xp.toFixed(2)}" y="${String(innerH + 22)}" text-anchor="middle" fill="var(--c-text)">${escapeXml(spec.xFormat(t))}</text>`,
    );
  }

  for (const t of yTicks) {
    const yp = y(t);
    parts.push(
      `<line x1="-5" y1="${yp.toFixed(2)}" x2="0" y2="${yp.toFixed(2)}" stroke="var(--c-axis)" stroke-width="1" />`,
    );
    parts.push(
      `<text x="-10" y="${(yp + 4).toFixed(2)}" text-anchor="end" fill="var(--c-text)">${escapeXml(spec.yFormat(t))}</text>`,
    );
  }

  parts.push(
    `<text x="${String(innerW / 2)}" y="${String(innerH + 48)}" text-anchor="middle" fill="var(--c-title)" font-size="13">${escapeXml(spec.xLabel)}</text>`,
  );
  parts.push(
    `<text transform="translate(-55,${String(innerH / 2)}) rotate(-90)" text-anchor="middle" fill="var(--c-title)" font-size="13">${escapeXml(spec.yLabel)}</text>`,
  );

  for (const [si, s] of spec.series.entries()) {
    const colorVar = `var(--c-s${String(si)})`;
    const points = s.points.map(([px, py]) => `${x(px).toFixed(2)},${y(py).toFixed(2)}`).join(' ');
    parts.push(
      `<polyline points="${points}" fill="none" stroke="${colorVar}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`,
    );
    for (const [px, py] of s.points) {
      parts.push(
        `<circle cx="${x(px).toFixed(2)}" cy="${y(py).toFixed(2)}" r="2" fill="${colorVar}" />`,
      );
    }
  }

  if (spec.series.length > 1 || spec.series[0]?.label) {
    const lx = innerW + 18;
    let ly = 0;
    for (const [si, s] of spec.series.entries()) {
      const colorVar = `var(--c-s${String(si)})`;
      parts.push(
        `<rect x="${String(lx)}" y="${String(ly)}" width="14" height="3" fill="${colorVar}" />`,
      );
      parts.push(
        `<text x="${String(lx + 22)}" y="${String(ly + 6)}" fill="var(--c-title)" font-size="12">${escapeXml(s.label)}</text>`,
      );
      ly += 22;
    }
  }

  parts.push(`</g>`);
  parts.push(`</svg>`);
  return parts.join('\n');
}

// ---- Chart specs ----

function inflacionFor(anio: number): number {
  const mult = INFLACION_A_2026[anio];
  if (mult === undefined) {
    throw new Error(`render-charts: INFLACION_A_2026[${String(anio)}] no definido`);
  }
  return mult;
}

function chartNetoRealMismoNominal(): ChartSpec {
  const points: [number, number][] = [];
  for (let a = 2012; a <= 2026; a++) {
    const n = calcularNomina(30000, a);
    points.push([a, n.salarioNeto * inflacionFor(a)]);
  }
  return {
    slug: 'neto-real-mismo-nominal',
    title: 'Neto real con bruto nominal fijo en 30 000 €',
    desc: 'Bruto nominal de 30 000 € en cada año entre 2012 y 2026, expresado el neto en € constantes de 2026. Pendiente decreciente: el mismo bruto nominal pierde poder adquisitivo real cada año.',
    xLabel: 'Año',
    yLabel: 'Neto en € de 2026',
    xFormat: (v) => String(Math.round(v)),
    yFormat: (v) => Math.round(v).toLocaleString('es-ES') + ' €',
    series: [{ label: 'Neto real (€ 2026)', points }],
  };
}

function brutoSeriesByYear(years: number[]): Series[] {
  const series: Series[] = [];
  for (const a of years) {
    const points: [number, number][] = [];
    const mult = inflacionFor(a);
    for (let b = 15000; b <= 80000; b += 1000) {
      const n = calcularNomina(b / mult, a);
      points.push([b, n.salarioNeto * mult]);
    }
    series.push({ label: String(a), points });
  }
  return series;
}

function chartNetoRealBrutoRealFijo(): ChartSpec {
  return {
    slug: 'neto-real-bruto-real-fijo',
    title: 'Neto real por bruto real, fiscalidad de cada año',
    desc: 'Para un mismo bruto medido en € constantes de 2026, qué neto real se obtiene aplicando la fiscalidad y SS de cada año. El espaciado vertical entre líneas mide el efecto neto de las reformas más la progresividad en frío.',
    xLabel: 'Bruto en € de 2026',
    yLabel: 'Neto en € de 2026',
    xFormat: (v) => Math.round(v / 1000) + 'k €',
    yFormat: (v) => Math.round(v / 1000) + 'k €',
    series: brutoSeriesByYear([2012, 2015, 2018, 2022, 2024, 2026]),
  };
}

function chartTipoMedioEfectivo(): ChartSpec {
  const series: Series[] = [];
  for (const a of [2012, 2015, 2018, 2022, 2024, 2026]) {
    const points: [number, number][] = [];
    const mult = inflacionFor(a);
    for (let b = 15000; b <= 80000; b += 1000) {
      const brutoNominal = b / mult;
      const n = calcularNomina(brutoNominal, a);
      const tipo = ((n.cotSocTrabajador + n.irpfFinal) / brutoNominal) * 100;
      points.push([b, tipo]);
    }
    series.push({ label: String(a), points });
  }
  return {
    slug: 'tipo-medio-efectivo',
    title: 'Tipo medio efectivo: cotización + IRPF sobre bruto',
    desc: 'Cuánto de cada euro bruto se convierte en cotización del trabajador más IRPF, expresado en porcentaje. Eje X en bruto real (€ de 2026) para que años distintos sean comparables a igual poder adquisitivo.',
    xLabel: 'Bruto en € de 2026',
    yLabel: 'Tipo medio efectivo',
    xFormat: (v) => Math.round(v / 1000) + 'k €',
    yFormat: (v) => v.toFixed(1) + ' %',
    series,
  };
}

// ---- Run ----

mkdirSync(OUT_DIR, { recursive: true });

const charts: ChartSpec[] = [
  chartNetoRealMismoNominal(),
  chartNetoRealBrutoRealFijo(),
  chartTipoMedioEfectivo(),
];

for (const c of charts) {
  const out = join(OUT_DIR, `${c.slug}.svg`);
  writeFileSync(out, renderChart(c) + '\n', 'utf8');
  console.log(`[charts] wrote ${out}`);
}
