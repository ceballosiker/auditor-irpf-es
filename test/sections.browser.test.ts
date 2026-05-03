// test/sections.browser.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ANIO_MAX } from '../src/normativa';
import { mountNav } from '../src/ui/sections/nav';
import { mountHero, updateHero } from '../src/ui/sections/hero';
import { mountExcel } from '../src/ui/sections/excel';

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
