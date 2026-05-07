// test/charts.browser.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderStackedBar, type StackedBarData } from '../src/ui/charts/stacked-bar';
import { renderVasos, type VasosData } from '../src/ui/charts/vasos';
import { renderGapArea, type GapAreaData } from '../src/ui/charts/gap-area';
import { renderMultiples, type MultiplesData } from '../src/ui/charts/multiples';

let host: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<div id="host"></div>';
  host = document.getElementById('host') as HTMLElement;
});
afterEach(() => {
  document.body.innerHTML = '';
});

describe('renderStackedBar', () => {
  const data: StackedBarData = {
    bruto: 30_000,
    neto: 24_518,
    irpf: 3_577,
    cotSocTrabajador: 1_905,
  };

  it('writes one <svg role="img"> with three segments and a key', () => {
    renderStackedBar(host, data);
    const svg = host.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('role')).toBe('img');
    const title = svg?.querySelector('title');
    expect(title?.textContent).toMatch(/Distribución del salario bruto/i);
    const segments = svg?.querySelectorAll('rect.segment');
    expect(segments?.length).toBe(3);
  });

  it('segment widths sum to ~100 % of the bar width (within rounding)', () => {
    renderStackedBar(host, data);
    const segs = Array.from(host.querySelectorAll<SVGRectElement>('rect.segment'));
    const widths = segs.map((s) => Number(s.getAttribute('width') ?? 0));
    const total = widths.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(99.5);
    expect(total).toBeLessThan(100.5);
  });

  it('handles bruto = 0 without throwing or producing NaN widths', () => {
    renderStackedBar(host, { bruto: 0, neto: 0, irpf: 0, cotSocTrabajador: 0 });
    const segs = Array.from(host.querySelectorAll<SVGRectElement>('rect.segment'));
    for (const s of segs) {
      const w = Number(s.getAttribute('width') ?? 0);
      expect(Number.isFinite(w)).toBe(true);
    }
  });
});

describe('renderVasos', () => {
  const data: VasosData = {
    tramos: [
      { idx: 1, tipo: 0.19, hasta: 12_450, baseAplicada: 12_450, cuota: 2_366 },
      { idx: 2, tipo: 0.24, hasta: 20_200, baseAplicada: 7_750, cuota: 1_860 },
      { idx: 3, tipo: 0.3, hasta: 35_200, baseAplicada: 2_298, cuota: 689 },
      { idx: 4, tipo: 0.37, hasta: 60_000, baseAplicada: 0, cuota: 0 },
      { idx: 5, tipo: 0.45, hasta: Infinity, baseAplicada: 0, cuota: 0 },
    ],
    baseImponible: 22_498,
  };

  it('renders one row per tramo', () => {
    renderVasos(host, data);
    const rows = host.querySelectorAll('.vasos-row');
    expect(rows.length).toBe(5);
  });

  it('marks tramos with zero cuota as empty', () => {
    renderVasos(host, data);
    const empties = host.querySelectorAll('.vasos-row.is-empty');
    expect(empties.length).toBe(2);
  });

  it('exposes a screen-reader-friendly label on the table region', () => {
    renderVasos(host, data);
    const table = host.querySelector('[role="table"]');
    expect(table?.getAttribute('aria-label') ?? '').toMatch(/Tramos del IRPF/i);
  });
});

describe('renderGapArea', () => {
  const data: GapAreaData = {
    years: [2012, 2013, 2014, 2015, 2026],
    gap: [0, 100, 220, 350, 1247],
  };

  it('renders an SVG with axes, an area path, a line path, and an endpoint marker', () => {
    renderGapArea(host, data);
    expect(host.querySelectorAll('svg').length).toBe(1);
    expect(host.querySelector('path.gap-area')).not.toBeNull();
    expect(host.querySelector('polyline.gap-line')).not.toBeNull();
    expect(host.querySelector('circle.gap-endpoint')).not.toBeNull();
  });

  it('exposes a screen-reader table mirroring the data', () => {
    renderGapArea(host, data);
    const rows = host.querySelectorAll('table.sr-only tbody tr');
    expect(rows.length).toBe(data.years.length);
  });
});

describe('renderMultiples', () => {
  const data: MultiplesData = {
    years: [2012, 2013, 2014, 2015, 2026],
    netoReal: [24_100, 24_050, 23_980, 23_900, 23_650],
    irpfReal: [3_200, 3_220, 3_250, 3_300, 3_578],
    tipoEfectivo: [0.107, 0.108, 0.11, 0.112, 0.119],
    ssReal: [1_950, 1_948, 1_945, 1_942, 1_910],
  };

  it('renders 4 mini-charts (one per series)', () => {
    renderMultiples(host, data);
    expect(host.querySelectorAll('svg.multi').length).toBe(4);
  });

  it('exposes per-series titles', () => {
    renderMultiples(host, data);
    const titles = Array.from(host.querySelectorAll('svg.multi title')).map(
      (t) => t.textContent ?? '',
    );
    expect(titles.some((t) => /Neto/i.test(t))).toBe(true);
    expect(titles.some((t) => /IRPF/i.test(t))).toBe(true);
    expect(titles.some((t) => /tipo efectivo/i.test(t))).toBe(true);
    expect(titles.some((t) => /Cotización SS/i.test(t))).toBe(true);
  });

  it('exposes a screen-reader table mirroring the data', () => {
    renderMultiples(host, data);
    const rows = host.querySelectorAll('table.sr-only tbody tr');
    expect(rows.length).toBe(data.years.length);
    // 4 series + the year column = 5 cells per row
    const firstRow = host.querySelector('table.sr-only tbody tr');
    expect(firstRow?.querySelectorAll('th, td').length).toBe(5);
  });

  it('each mini-chart includes y-axis (min/max) and x-axis (first/last year) labels', () => {
    renderMultiples(host, data);
    const charts = host.querySelectorAll('svg.multi');
    expect(charts.length).toBe(4);
    charts.forEach((svg) => {
      expect(svg.querySelectorAll('text.multi-axis-y').length).toBe(2);
      expect(svg.querySelectorAll('text.multi-axis-x').length).toBe(2);
    });
    const xLabels = Array.from(host.querySelectorAll('text.multi-axis-x')).map(
      (t) => t.textContent ?? '',
    );
    expect(xLabels).toContain('2012');
    expect(xLabels).toContain('2026');
  });
});
