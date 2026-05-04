import '../src/ui/theme.css';
import '../src/ui/sr-only.css';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mountApp } from '../src/ui/app.js';

function setupApp(): HTMLElement {
  document.body.innerHTML = '<div id="app"></div>';
  const app = document.getElementById('app');
  if (!app) throw new Error('test setup: #app not in DOM');
  mountApp(app);
  return app;
}

describe('mountApp ?anio= URL roundtrip', () => {
  beforeEach(() => {
    // Start each case from a clean URL so prior writes do not leak across tests.
    window.history.replaceState(null, '', window.location.pathname);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.history.replaceState(null, '', window.location.pathname);
  });

  it('preselects the year in the form when ?anio=YYYY is in the URL', () => {
    window.history.replaceState(null, '', `${window.location.pathname}?anio=2018`);
    setupApp();
    const select = document.querySelector<HTMLSelectElement>('#input-anio');
    if (!select) throw new Error('year select missing');
    expect(select.value).toBe('2018');
  });

  it('writes ?anio=YYYY to the URL when the year changes', () => {
    setupApp();
    const select = document.querySelector<HTMLSelectElement>('#input-anio');
    if (!select) throw new Error('year select missing');
    select.value = '2020';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(window.location.search).toContain('anio=2020');
  });
});
