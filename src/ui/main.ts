import '@picocss/pico/css/pico.min.css';
import { ANIO_MAX } from '../normativa.js';
import { mountForm } from './form.js';
import type { FormState } from './form.js';
import { render } from './render.js';
import { renderResults } from './results.js';

const app = document.getElementById('app');
if (!app) {
  throw new Error('Mount point #app not found in index.html');
}

render(
  app,
  `
    <header>
      <hgroup>
        <h1>Calculadora IRPF España</h1>
        <p>Salario neto, IRPF y cotización social entre 2012 y ${String(ANIO_MAX)}.</p>
      </hgroup>
    </header>
    <section id="form-section"></section>
    <section id="results-section" aria-live="polite"></section>
  `,
);

const formSection = app.querySelector<HTMLElement>('#form-section');
const resultsSection = app.querySelector<HTMLElement>('#results-section');
if (!formSection || !resultsSection) {
  throw new Error('Layout sections not found after initial render');
}

const initial: FormState = { bruto: 30000, anio: ANIO_MAX };

function update(state: FormState): void {
  if (!resultsSection) return;
  if (!Number.isInteger(state.anio)) {
    render(resultsSection, '<p role="alert">Año no válido.</p>');
    return;
  }
  renderResults(resultsSection, state.bruto, state.anio);
}

mountForm(formSection, { initial, onChange: update });
update(initial);
