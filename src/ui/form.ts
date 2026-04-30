import { ANIOS_SOPORTADOS } from '../normativa.js';
import { render } from './render.js';

export interface FormState {
  readonly bruto: number;
  readonly anio: number;
}

export interface FormOptions {
  readonly initial: FormState;
  readonly onChange: (state: FormState) => void;
}

export function mountForm(target: HTMLElement, opts: FormOptions): void {
  const { initial, onChange } = opts;

  const yearOptions = [...ANIOS_SOPORTADOS]
    .reverse()
    .map(
      (y) =>
        `<option value="${String(y)}"${y === initial.anio ? ' selected' : ''}>${String(y)}</option>`,
    )
    .join('');

  render(
    target,
    `
      <form id="calc-form" autocomplete="off" novalidate>
        <div class="grid">
          <label>
            Salario bruto anual (€)
            <input
              type="number"
              id="input-bruto"
              name="bruto"
              min="0"
              step="100"
              value="${String(initial.bruto)}"
              inputmode="numeric"
              required
            />
            <small>Importe íntegro antes de cotización social y retención.</small>
          </label>
          <label>
            Año fiscal
            <select id="input-anio" name="anio">${yearOptions}</select>
            <small>Normativa aplicable a 31 de diciembre.</small>
          </label>
          <label>
            Comunidad Autónoma
            <select id="input-ccaa" name="ccaa" disabled>
              <option value="estatal" selected>Estatal (escala duplicada)</option>
            </select>
            <small>Las escalas autonómicas llegan en una versión posterior.</small>
          </label>
        </div>
      </form>
    `,
  );

  const form = target.querySelector<HTMLFormElement>('#calc-form');
  const brutoInput = target.querySelector<HTMLInputElement>('#input-bruto');
  const anioSelect = target.querySelector<HTMLSelectElement>('#input-anio');
  if (!form || !brutoInput || !anioSelect) {
    throw new Error('Form mount: expected fields not found in DOM');
  }

  function readState(): FormState {
    const bruto = Number.parseFloat(brutoInput?.value ?? '0');
    const anio = Number.parseInt(anioSelect?.value ?? '0', 10);
    return {
      bruto: Number.isFinite(bruto) && bruto >= 0 ? bruto : 0,
      anio,
    };
  }

  function emit(): void {
    onChange(readState());
  }

  brutoInput.addEventListener('input', emit);
  anioSelect.addEventListener('change', emit);
}
