// src/ui/app.ts
import { ANIO_MAX } from '../normativa.js';
import { requireEl } from './dom.js';
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

  const navSec = requireEl<HTMLElement>(app, '#nav-section');
  const heroSec = requireEl<HTMLElement>(app, '#hero-section');
  const breakdownSec = requireEl<HTMLElement>(app, '#breakdown-section');
  const bracketsSec = requireEl<HTMLElement>(app, '#brackets-section');
  const historySec = requireEl<HTMLElement>(app, '#history-section');
  const excelSec = requireEl<HTMLElement>(app, '#excel-section');

  mountNav(navSec);
  mountHero(heroSec);
  mountBreakdown(breakdownSec);
  mountBrackets(bracketsSec);
  mountHistory(historySec);
  mountExcel(excelSec);

  // Form lives inside the hero section's #form-section slot.
  const formMount = requireEl<HTMLElement>(heroSec, '#form-section');

  const initial: FormState = { bruto: 30_000, anio: ANIO_MAX };

  function update(state: FormState): void {
    if (!Number.isInteger(state.anio)) return;
    updateHero(heroSec, state);
    updateBreakdown(breakdownSec, state);
    updateBrackets(bracketsSec, state);
    updateHistory(historySec, state);
  }

  mountForm(formMount, { initial, onChange: update });
  update(initial);
}
