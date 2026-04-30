import { render } from './render.js';

const FILENAME = 'Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx';

type State = 'idle' | 'generating' | 'error';

function buttonHtml(state: State, errorMessage?: string): string {
  const disabled = state === 'generating' ? 'aria-busy="true" disabled' : '';
  const label =
    state === 'generating' ? 'Generando Excel…' : 'Descargar Excel completo (2012–2026)';
  const error =
    state === 'error' && errorMessage
      ? `<p role="alert" style="color: var(--pico-color-red-500);">${errorMessage}</p>`
      : '';
  return `
    <button type="button" id="excel-download" ${disabled}>${label}</button>
    <small>Genera todas las pestañas del libro Excel (control general, tramos IRPF, comparativa de inflación y datos año a año) en el navegador. Sin red, sin servidor.</small>
    ${error}
  `;
}

async function generateAndDownload(): Promise<void> {
  const { generarExcelBlob } = await import('../excel.js');
  const blob = generarExcelBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

export function mountExcelButton(target: HTMLElement): void {
  let state: State = 'idle';
  let errorMessage: string | undefined;

  function rerender(): void {
    render(target, buttonHtml(state, errorMessage));
    const button = target.querySelector<HTMLButtonElement>('#excel-download');
    button?.addEventListener('click', onClick);
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
        errorMessage =
          err instanceof Error
            ? `No se pudo generar el Excel: ${err.message}`
            : 'No se pudo generar el Excel.';
      } finally {
        rerender();
      }
    })();
  }

  rerender();
}
