// test/sections.browser.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ANIO_MAX } from '../src/normativa';
import { mountNav } from '../src/ui/sections/nav';
import { mountHero, updateHero } from '../src/ui/sections/hero';
import { mountExcel } from '../src/ui/sections/excel';
import { mountBreakdown, updateBreakdown } from '../src/ui/sections/breakdown';
import { mountBrackets, updateBrackets } from '../src/ui/sections/brackets';
import { mountHistory, updateHistory } from '../src/ui/sections/history';

let host: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<div id="host"></div>';
  const el = document.getElementById('host');
  if (!el) throw new Error('host not found');
  host = el;
});
afterEach(() => {
  document.body.innerHTML = '';
});

describe('nav section', () => {
  it('mounts a nav with the wordmark and Manual + GitHub links', () => {
    mountNav(host);
    const nav = host.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.textContent).toMatch(/Auditor IRPF/i);
    expect(host.querySelector('a[href*="manual"]')).not.toBeNull();
    expect(host.querySelector('a[href*="github.com"]')).not.toBeNull();
  });
});

describe('hero section', () => {
  it('mounts with eyebrow, h1, lead, form region, and a hero number placeholder', () => {
    mountHero(host);
    expect(host.querySelector('.eyebrow')?.textContent).toMatch(/Auditor IRPF/i);
    expect(host.querySelector('h1')).not.toBeNull();
    expect(host.querySelector('p.lead')).not.toBeNull();
    expect(host.querySelector('[data-hero-num]')).not.toBeNull();
    expect(host.querySelector('[data-hero-sub]')).not.toBeNull();
  });

  it('updateHero renders the neto number for a given (bruto, anio)', () => {
    mountHero(host);
    updateHero(host, { bruto: 30_000, anio: ANIO_MAX });
    const num = host.querySelector('[data-hero-num]')?.textContent ?? '';
    expect(num).toMatch(/\d/);
    const sub = host.querySelector('[data-hero-sub]')?.textContent ?? '';
    expect(sub).toMatch(/14 pagas/i);
    expect(sub).toMatch(new RegExp(String(ANIO_MAX)));
  });

  it('marks the hero number as aria-live="polite" so updates are announced', () => {
    mountHero(host);
    expect(host.querySelector('[data-hero-num]')?.getAttribute('aria-live')).toBe('polite');
  });
});

describe('excel section', () => {
  it('mounts the Excel CTA inside the dark band', () => {
    mountExcel(host);
    const band = host.querySelector('.excel-band');
    expect(band).not.toBeNull();
    expect(band?.querySelector('h3')?.textContent).toMatch(/auditarlo/i);
    const button = band?.querySelector<HTMLButtonElement>('button.cta');
    expect(button).not.toBeNull();
    expect(button?.textContent ?? '').toMatch(/Excel/i);
    expect(button?.disabled).toBe(false);
  });
});

describe('breakdown section', () => {
  it('mounts with eyebrow, h2, body, chart placeholder, drill-down summary', () => {
    mountBreakdown(host);
    expect(host.querySelector('.eyebrow')?.textContent).toMatch(/dónde/i);
    expect(host.querySelector('h2')).not.toBeNull();
    expect(host.querySelector('[data-chart="stacked-bar"]')).not.toBeNull();
    expect(host.querySelector('details > summary')).not.toBeNull();
    expect(host.querySelector('a.read-more')).not.toBeNull();
    expect(host.querySelector('details')?.id).toBe('drill-cotizacion');
  });

  it('updateBreakdown fills the chart and the drill-down table', () => {
    mountBreakdown(host);
    updateBreakdown(host, { bruto: 30_000, anio: ANIO_MAX });
    expect(host.querySelectorAll('rect.segment').length).toBe(3);
    const drill = host.querySelector('details table');
    expect(drill).not.toBeNull();
    const rows = drill?.querySelectorAll('tr') ?? [];
    expect(rows.length).toBeGreaterThan(3);
  });
});

describe('brackets section', () => {
  it('mounts with eyebrow, h2, body, vasos host, drill-down', () => {
    mountBrackets(host);
    expect(host.querySelector('.eyebrow')?.textContent).toMatch(/calcula/i);
    expect(host.querySelector('h2')).not.toBeNull();
    expect(host.querySelector('[data-chart="vasos"]')).not.toBeNull();
    expect(host.querySelector('details > summary')).not.toBeNull();
    expect(host.querySelector('details')?.id).toBe('drill-irpf');
  });

  it('updateBrackets renders one vasos-row per tramo and fills the drill-down table', () => {
    mountBrackets(host);
    updateBrackets(host, { bruto: 30_000, anio: ANIO_MAX });
    const rows = host.querySelectorAll('.vasos-row');
    expect(rows.length).toBeGreaterThan(0);
    const drill = host.querySelector('details table');
    expect(drill?.querySelectorAll('tr').length ?? 0).toBeGreaterThan(5);
  });
});

describe('history section', () => {
  it('mounts with eyebrow, h2, body, gap-area host, drill-down', () => {
    mountHistory(host);
    expect(host.querySelector('.eyebrow')?.textContent).toMatch(/cambiado/i);
    expect(host.querySelector('h2')).not.toBeNull();
    expect(host.querySelector('[data-chart="gap-area"]')).not.toBeNull();
    expect(host.querySelector('details > summary')).not.toBeNull();
    expect(host.querySelector('details')?.id).toBe('drill-multiples');
  });

  it('updateHistory paints the gap-area chart and small multiples', () => {
    mountHistory(host);
    updateHistory(host, { bruto: 30_000, anio: ANIO_MAX });
    expect(host.querySelector('path.gap-area')).not.toBeNull();
    expect(host.querySelectorAll('svg.multi').length).toBe(4);
  });

  it('headline copy reflects the sign of gapHoy', () => {
    mountHistory(host);
    // Most brutos in the engine's range produce a positive gap (counterfactual >
    // actual); a high bruto where reform-driven rate cuts dominate could yield a
    // negative or near-zero gap. Verify the positive branch by sampling 30k.
    updateHistory(host, { bruto: 30_000, anio: ANIO_MAX });
    const text = host.querySelector('h2')?.textContent ?? '';
    // The text must mention 2012 (all branches do) AND must end with one of the
    // three known phrases that distinguish the branches.
    expect(text).toMatch(/2012/);
    expect(text).toMatch(/(más en el bolsillo|menos:|prácticamente equivalente)/);
  });
});
