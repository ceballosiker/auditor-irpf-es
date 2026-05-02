import { ANIO_MAX } from '../normativa.js';
import { mountExcelButton } from './excel-button.js';
import { mountForm } from './form.js';
import type { FormState } from './form.js';
import { render } from './render.js';
import { renderResults } from './results.js';

export function mountApp(app: HTMLElement): void {
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
    <section id="chart-section">
      <h2>Comparativa frente a inflación</h2>
      <p>
        Manteniendo el bruto constante en euros de ${String(ANIO_MAX)}, este gráfico
        muestra qué neto e IRPF reales obtendría el mismo poder adquisitivo en
        cada año entre ${String(2012)} y ${String(ANIO_MAX)}.
      </p>
      <div class="chart-container" style="position: relative; height: clamp(240px, 40vh, 360px);">
        <canvas id="chart-comparativa" role="img" aria-label="Bruto, neto e IRPF reales (€ de 2026) entre 2012 y 2026"></canvas>
      </div>
      <div id="chart-sr-only"></div>
    </section>
    <section id="excel-section">
      <h2>Descargar libro Excel</h2>
      <div id="excel-button-mount"></div>
    </section>
  `,
  );

  const formSection = app.querySelector<HTMLElement>('#form-section');
  const resultsSection = app.querySelector<HTMLElement>('#results-section');
  const chartCanvas = app.querySelector<HTMLCanvasElement>('#chart-comparativa');
  const chartSrOnly = app.querySelector<HTMLElement>('#chart-sr-only');
  const excelMount = app.querySelector<HTMLElement>('#excel-button-mount');
  if (!formSection || !resultsSection || !chartCanvas || !chartSrOnly || !excelMount) {
    throw new Error('Layout sections not found after initial render');
  }

  mountExcelButton(excelMount);

  const initial: FormState = { bruto: 30000, anio: ANIO_MAX };

  let lastBruto: number | undefined;

  function update(state: FormState): void {
    if (!resultsSection || !chartCanvas || !chartSrOnly) return;
    if (!Number.isInteger(state.anio)) {
      render(resultsSection, '<p role="alert">Año no válido.</p>');
      return;
    }
    renderResults(resultsSection, state.bruto, state.anio);
    if (state.bruto !== lastBruto) {
      const bruto = state.bruto;
      void import('./chart.js').then((mod) => {
        if (!chartCanvas || !chartSrOnly) return;
        const series = mod.comparativaSeries(bruto);
        mod.renderComparativaInflacion(chartCanvas, series);
        mod.renderComparativaTableSrOnly(chartSrOnly, series);
      });
      lastBruto = bruto;
    }
  }

  mountForm(formSection, { initial, onChange: update });
  update(initial);
}
