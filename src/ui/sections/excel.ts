// src/ui/sections/excel.ts
import { render } from '../render.js';

const FILENAME = 'Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx';

type State = 'idle' | 'generating' | 'error';

function bandHtml(state: State, error?: string): string {
  const busy = state === 'generating' ? 'aria-busy="true" disabled' : '';
  const label = state === 'generating' ? 'Generando Excel…' : '↓ Descargar Excel completo (2012 – 2026)';
  const err = state === 'error' && error
    ? `<p role="alert" style="color:var(--accent);font-size:0.85rem;margin-top:8px;">${error}</p>`
    : '';
  return `
    <section class="excel-band">
      <h3>¿Quieres auditarlo tú?</h3>
      <p class="lead">Descarga el libro Excel completo: control general, tramos IRPF, comparativa de inflación y datos año a año. Todo el cálculo se ejecuta en tu navegador, sin servidor.</p>
      <button type="button" class="cta" id="excel-download" ${busy}>${label}</button>
      ${err}
    </section>
  `;
}

async function generateAndDownload(): Promise<void> {
  const { generarExcelBlob } = await import('../../excel.js');
  const blob = generarExcelBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function mountExcel(target: HTMLElement): void {
  let state: State = 'idle';
  let errorMessage: string | undefined;

  function rerender(): void {
    render(target, bandHtml(state, errorMessage));
    target.querySelector<HTMLButtonElement>('#excel-download')?.addEventListener('click', onClick);
  }

  function onClick(): void {
    if (state === 'generating') return;
    state = 'generating';
    errorMessage = undefined;
    rerender();
    void (async (): Promise<void> => {
      try {
        await generateAndDownload();
        state = 'idle';
      } catch (err) {
        state = 'error';
        errorMessage = err instanceof Error
          ? `No se pudo generar el Excel: ${err.message}`
          : 'No se pudo generar el Excel.';
      } finally {
        rerender();
      }
    })();
  }

  rerender();
}
