import { ANIO_MAX, ANIO_MIN } from '../normativa.js';
import { requireEl } from './dom.js';
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

  render(
    target,
    `
      <form id="calc-form" autocomplete="off" novalidate>
        <div class="anio-band">
          <label for="input-anio">Año fiscal</label>
          <div class="anio-track">
            <input
              type="range"
              id="input-anio"
              name="anio"
              min="${String(ANIO_MIN)}"
              max="${String(ANIO_MAX)}"
              step="1"
              value="${String(initial.anio)}"
              aria-valuetext="${String(initial.anio)}"
            />
            <output for="input-anio" class="anio-output" aria-live="polite">${String(initial.anio)}</output>
          </div>
          <div class="anio-ticks" aria-hidden="true">
            <span>${String(ANIO_MIN)}</span>
            <span>${String(ANIO_MAX)}</span>
          </div>
          <small>Normativa aplicable a 31 de diciembre.</small>
        </div>
        <div class="form-row form-row--2col">
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

  const brutoInput = requireEl<HTMLInputElement>(target, '#input-bruto');
  const anioInput = requireEl<HTMLInputElement>(target, '#input-anio');
  const anioOutput = requireEl<HTMLOutputElement>(target, 'output[for="input-anio"]');

  function readState(): FormState {
    const bruto = Number.parseFloat(brutoInput.value);
    const anio = Number.parseInt(anioInput.value, 10);
    return {
      bruto: Number.isFinite(bruto) && bruto >= 0 ? bruto : 0,
      anio,
    };
  }

  function syncAnioDisplay(value: string): void {
    anioOutput.textContent = value;
    anioInput.setAttribute('aria-valuetext', value);
  }

  function emitBruto(): void {
    onChange(readState());
  }

  function emitAnio(): void {
    syncAnioDisplay(anioInput.value);
    onChange(readState());
  }

  brutoInput.addEventListener('input', emitBruto);
  anioInput.addEventListener('input', emitAnio);
}
