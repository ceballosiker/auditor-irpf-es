// src/ui/sections/hero.ts
import { calcularNomina } from '../../pipeline.js';
import { eur } from '../format.js';
import { render } from '../render.js';

interface HeroState {
  readonly bruto: number;
  readonly anio: number;
}

export function mountHero(target: HTMLElement): void {
  render(
    target,
    `
    <section>
      <div class="eyebrow">Auditor IRPF · 2012 – 2026</div>
      <h1>Cuánto del salario que cuestas a tu empresa termina realmente en tu bolsillo.</h1>
      <p class="lead">Una calculadora pública del IRPF y la Seguridad Social en España, capaz de mostrar quince años de fiscalidad — y la pérdida de poder adquisitivo que la "progresividad en frío" ha ido acumulando entre 2012 y 2026.</p>
      <div id="form-section" aria-label="Salario y año fiscal"></div>
      <div class="hero-num" data-hero-num aria-live="polite">—</div>
      <div class="hero-sub" data-hero-sub>—</div>
    </section>
  `,
  );
}

export function updateHero(target: HTMLElement, state: HeroState): void {
  const nomina = calcularNomina(state.bruto, state.anio);
  const monthly = nomina.salarioNeto / 14;
  const num = target.querySelector('[data-hero-num]');
  const sub = target.querySelector('[data-hero-sub]');
  if (num) num.textContent = eur(nomina.salarioNeto);
  if (sub) sub.textContent = `Salario neto anual · ${eur(monthly)}/mes con 14 pagas · normativa estatal de ${String(state.anio)}`;
}
