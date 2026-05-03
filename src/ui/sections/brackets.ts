// src/ui/sections/brackets.ts
import { calcularNominaConParametros, obtenerParametros } from '../../index.js';
import type { Nomina, Parametros } from '../../index.js';
import { renderVasos } from '../charts/vasos.js';
import { eur, percent } from '../format.js';
import { render } from '../render.js';

interface State { readonly bruto: number; readonly anio: number; }

export function mountBrackets(target: HTMLElement): void {
  render(
    target,
    `
    <section>
      <div class="eyebrow">¿Cómo se calcula el IRPF?</div>
      <h2>Tu salario «atraviesa» los tramos. Solo lo que cabe en cada tramo paga su tipo.</h2>
      <p>No todo tu sueldo paga el mismo porcentaje. Cada tramo es un «vaso» que se llena por orden, y solo lo que cabe en cada uno paga el tipo de ese tramo.</p>
      <div data-chart="vasos"></div>
      <a class="read-more" href="/manual/motor/06-tramos-irpf/">Si quieres profundizar: cómo funcionan los tramos →</a>
      <details>
        <summary>Ver tramos completos, mínimo personal, deducción SMI y tope 43 %</summary>
        <div data-drill="irpf"></div>
      </details>
    </section>
  `,
  );
}

function row(label: string, value: string, hint?: string): string {
  const h = hint ? `<br><small>${hint}</small>` : '';
  return `<tr><th scope="row">${label}${h}</th><td>${value}</td></tr>`;
}

function drillTable(n: Nomina, p: Parametros): string {
  const tope43Aplica = n.cuotaTrasSMI > n.limite43 + 1e-6;
  const firstTipo = p.tramosIRPF[0]?.tipo ?? 0;
  const rows = [
    row('Rendimiento previo (bruto − cot. trabajador)', eur(n.renPrevio)),
    row('Reducción Art. 20', eur(n.redRenTrabajo)),
    row('Gastos fijos Art. 19', eur(n.gastosFijos)),
    row('Base imponible', eur(n.baseImponible)),
    row('Cuota íntegra (suma tramos)', eur(n.cuotaIntegra)),
    row('Cuota mínimo personal', eur(n.cuotaMinimoPersonal), `Mínimo aplicado al tipo del primer tramo (${percent(firstTipo)}).`),
    row('Cuota teórica (íntegra − mínimo)', eur(n.cuotaTeorica)),
    ...(n.deduccionSMI > 0 ? [row('Deducción SMI', eur(n.deduccionSMI))] : []),
    row('Cuota tras SMI', eur(n.cuotaTrasSMI)),
    row(
      'Tope 43 % sobre (bruto − mínimo exento)',
      `${eur(n.limite43)} <small>(${tope43Aplica ? 'aplica' : 'no aplica'})</small>`,
      tope43Aplica ? `Cuota teórica supera el tope; el IRPF final se recorta a ${eur(n.limite43)}.` : undefined,
    ),
    row('IRPF final', `<strong>${eur(n.irpfFinal)}</strong>`),
  ].join('');
  return `<table>${rows}</table>`;
}

export function updateBrackets(target: HTMLElement, state: State): void {
  const params = obtenerParametros(state.anio);
  const nomina = calcularNominaConParametros(state.bruto, params);

  const tramosViz = nomina.cuotasPorTramo.map((c, i) => {
    const param = params.tramosIRPF[i];
    const baseAplicada = c.tipo > 0 ? c.cuota / c.tipo : 0;
    return {
      idx: i + 1,
      tipo: c.tipo,
      hasta: param?.hasta ?? Infinity,
      baseAplicada,
      cuota: c.cuota,
    };
  });

  const chartHost = target.querySelector<HTMLElement>('[data-chart="vasos"]');
  if (chartHost) renderVasos(chartHost, { tramos: tramosViz, baseImponible: nomina.baseImponible });

  const drill = target.querySelector<HTMLElement>('[data-drill="irpf"]');
  if (drill) drill.innerHTML = drillTable(nomina, params);
}
