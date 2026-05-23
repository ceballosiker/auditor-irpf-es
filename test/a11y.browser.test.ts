import '../src/ui/theme.css';
import '../src/ui/sr-only.css';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mountApp } from '../src/ui/app.js';

const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

async function scanForCriticalViolations(): Promise<axe.Result[]> {
  const results = await axe.run(document.body, {
    runOnly: { type: 'tag', values: A11Y_TAGS },
  });
  return results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
}

async function waitForRender(selector: string, timeoutMs = 2000): Promise<HTMLElement> {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el && el.children.length > 0) return el;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Timed out waiting for ${selector}`);
}

function setupApp(): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  const app = document.getElementById('app');
  if (!app) throw new Error('test setup: #app not in DOM');
  mountApp(app);
  return app;
}

function suiteFor(theme: 'light' | 'dark'): void {
  describe(`a11y: SPA passes axe-core (WCAG 2.1 AA) — ${theme}`, () => {
    beforeEach(() => {
      document.documentElement.dataset.theme = theme;
    });

    afterEach(() => {
      document.body.innerHTML = '';
      delete document.documentElement.dataset.theme;
    });

    it('has no serious or critical violations on initial render', async () => {
      setupApp();
      await waitForRender('#hero-section');
      const violations = await scanForCriticalViolations();
      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });

    it('has no serious or critical violations after changing bruto', async () => {
      setupApp();
      await waitForRender('#hero-section');
      const input = document.querySelector<HTMLInputElement>('#input-bruto');
      if (!input) throw new Error('bruto input missing');
      input.value = '45000';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 500));
      const violations = await scanForCriticalViolations();
      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });

    it('has no serious or critical violations while the Excel button shows aria-busy', async () => {
      // We set aria-busy directly rather than clicking the button: a real click
      // would trigger the full 15-year x 100k-row workbook build (minutes of
      // CPU). The point of this scan is to verify the busy-state markup is
      // accessible, not to exercise SheetJS.
      setupApp();
      await waitForRender('#hero-section');
      const button = document.querySelector<HTMLButtonElement>('#excel-download');
      if (!button) throw new Error('excel-download button missing');
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
      const violations = await scanForCriticalViolations();
      expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
    });
  });
}

suiteFor('light');
suiteFor('dark');
