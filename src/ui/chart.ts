import { Chart } from 'chart.js/auto';
import { ANIO_MAX, ANIO_MIN, INFLACION_A_2026, calcularNomina } from '../index.js';
import { eur } from './format.js';
import { render } from './render.js';

const PALETTE = {
  bruto: '#1f4e79',
  neto: '#2ca02c',
  irpf: '#d62728',
} as const;

export interface Series {
  readonly bruto: number[];
  readonly neto: number[];
  readonly irpf: number[];
  readonly years: number[];
}

export function comparativaSeries(bruto2026: number): Series {
  const years: number[] = [];
  const brutoR: number[] = [];
  const netoR: number[] = [];
  const irpfR: number[] = [];

  for (let a = ANIO_MIN; a <= ANIO_MAX; a++) {
    const mult = INFLACION_A_2026[a] ?? 1;
    const brutoNominal = bruto2026 / mult;
    const n = calcularNomina(brutoNominal, a);
    years.push(a);
    brutoR.push(bruto2026);
    netoR.push(n.salarioNeto * mult);
    irpfR.push(n.irpfFinal * mult);
  }
  return { years, bruto: brutoR, neto: netoR, irpf: irpfR };
}

let current: Chart | undefined;

export function renderComparativaInflacion(canvas: HTMLCanvasElement, data: Series): void {
  current?.destroy();
  current = new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.years.map(String),
      datasets: [
        {
          label: 'Bruto real (€ 2026)',
          data: data.bruto,
          borderColor: PALETTE.bruto,
          backgroundColor: PALETTE.bruto,
          borderDash: [6, 4],
          tension: 0,
          pointRadius: 0,
        },
        {
          label: 'Neto real (€ 2026)',
          data: data.neto,
          borderColor: PALETTE.neto,
          backgroundColor: PALETTE.neto,
          tension: 0.15,
        },
        {
          label: 'IRPF real (€ 2026)',
          data: data.irpf,
          borderColor: PALETTE.irpf,
          backgroundColor: PALETTE.irpf,
          tension: 0.15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label ?? ''}: ${eur(Number(ctx.parsed.y))}`,
          },
        },
        title: {
          display: true,
          text: 'Poder adquisitivo: bruto fijo en € de 2026, fiscalidad de cada año',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => eur(Number(v)),
          },
        },
      },
    },
  });
}

export function renderComparativaTableSrOnly(target: HTMLElement, data: Series): void {
  const rows = data.years
    .map(
      (y, i) =>
        `<tr><th scope="row">${String(y)}</th>` +
        `<td>${eur(data.bruto[i] ?? 0)}</td>` +
        `<td>${eur(data.neto[i] ?? 0)}</td>` +
        `<td>${eur(data.irpf[i] ?? 0)}</td></tr>`,
    )
    .join('');
  render(
    target,
    `
    <table class="sr-only">
      <caption>Bruto, neto e IRPF reales (€ de 2026) entre 2012 y 2026</caption>
      <thead>
        <tr><th scope="col">Año</th><th scope="col">Bruto real</th><th scope="col">Neto real</th><th scope="col">IRPF real</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `,
  );
}
