// src/ui/app.ts
import { ANIO_MAX } from '../normativa.js';
import { mountForm } from './form.js';
import type { FormState } from './form.js';
import { mountBreakdown, updateBreakdown } from './sections/breakdown.js';
import { mountBrackets, updateBrackets } from './sections/brackets.js';
import { mountExcel } from './sections/excel.js';
import { mountHero, updateHero } from './sections/hero.js';
import { mountHistory, updateHistory } from './sections/history.js';
import { mountNav } from './sections/nav.js';
import { render } from './render.js';

export function mountApp(app: HTMLElement): void {
  render(
    app,
    `
    <div id="nav-section"></div>
    <main class="container">
      <div id="hero-section"></div>
      <div id="breakdown-section"></div>
      <div id="brackets-section"></div>
      <div id="history-section"></div>
      <div id="excel-section"></div>
    </main>
  `,
  );

  const navSec       = app.querySelector<HTMLElement>('#nav-section');
  const heroSec      = app.querySelector<HTMLElement>('#hero-section');
  const breakdownSec = app.querySelector<HTMLElement>('#breakdown-section');
  const bracketsSec  = app.querySelector<HTMLElement>('#brackets-section');
  const historySec   = app.querySelector<HTMLElement>('#history-section');
  const excelSec     = app.querySelector<HTMLElement>('#excel-section');
  if (!navSec || !heroSec || !breakdownSec || !bracketsSec || !historySec || !excelSec) {
    throw new Error('Layout sections not found after initial render');
  }

  mountNav(navSec);
  mountHero(heroSec);
  mountBreakdown(breakdownSec);
  mountBrackets(bracketsSec);
  mountHistory(historySec);
  mountExcel(excelSec);

  // Form lives inside the hero section's #form-section slot.
  const formMount = heroSec.querySelector<HTMLElement>('#form-section');
  if (!formMount) throw new Error('#form-section slot missing in hero');

  const initial: FormState = { bruto: 30_000, anio: ANIO_MAX };

  function update(state: FormState): void {
    if (!Number.isInteger(state.anio)) return;
    if (!heroSec || !breakdownSec || !bracketsSec || !historySec) return;
    updateHero(heroSec, state);
    updateBreakdown(breakdownSec, state);
    updateBrackets(bracketsSec, state);
    updateHistory(historySec, state);
  }

  mountForm(formMount, { initial, onChange: update });
  update(initial);
}
