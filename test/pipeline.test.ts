import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { calcularNomina } from '../src/pipeline';
import type { Nomina } from '../src/types';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(HERE, '..', 'tests', 'fixtures');

type FixtureValue = number;
type FixtureRow = Record<string, FixtureValue>;
interface Fixture {
  anio: number;
  rows: FixtureRow[];
}

function loadFixture(anio: number): Fixture {
  const path = join(FIXTURES_DIR, `golden_${String(anio)}.json`);
  return JSON.parse(readFileSync(path, 'utf-8')) as Fixture;
}

function r2(n: number): number {
  // Match Python's round(x, 2). Python looks at the float's true decimal
  // expansion (via David Gay's dtoa) and applies banker's rule only on
  // *exact* halves; near-halves round to nearest. Multiplying by 100 in JS
  // can collapse a near-half into an exact half (e.g. 2486.0250000000004
  // → 248602.5 exactly), so we work from `toFixed(20)` instead.
  if (!Number.isFinite(n) || n === 0) return n;
  const sign = n < 0 ? -1 : 1;
  const s = Math.abs(n).toFixed(20);
  const [intPartRaw = '0', fracPartRaw = ''] = s.split('.');
  if (fracPartRaw.length <= 2) return n;
  const keep = fracPartRaw.slice(0, 2);
  const rest = fracPartRaw.slice(2);
  const halfRest = `5${'0'.repeat(rest.length - 1)}`;
  let increment: 0 | 1;
  if (rest > halfRest) {
    increment = 1;
  } else if (rest < halfRest) {
    increment = 0;
  } else {
    // Exact half — banker's: round to even.
    increment = (keep.charCodeAt(1) - 48) % 2 === 0 ? 0 : 1;
  }
  const base = Number(`${intPartRaw}.${keep}`);
  return sign * Number((base + increment * 0.01).toFixed(2));
}

function tramoLabel(idx: number, tipo: number): string {
  // Reproduce Python's f"T{i+1} ({round(tipo*100, 1)}%)"
  const pct = (Math.round(tipo * 1000) / 10).toFixed(1);
  return `T${String(idx + 1)} (${pct}%)`;
}

function nominaToFixtureRow(n: Nomina): FixtureRow {
  const row: FixtureRow = {
    'Salario Bruto': n.bruto,
    'Cot. Soc. Empresa': r2(n.cotSocEmpresa),
    'Coste Laboral': r2(n.costeLaboral),
    'Cot. Soc. Trab.': r2(n.cotSocTrabajador),
    'Ren. Previo': r2(n.renPrevio),
    'Gastos Fijos': n.gastosFijos,
    'Red. Ren. Trab.': r2(n.redRenTrabajo),
    'Base Imponible': r2(n.baseImponible),
  };
  n.cuotasPorTramo.forEach((c, i) => {
    row[tramoLabel(i, c.tipo)] = r2(c.cuota);
  });
  row['Cuota Íntegra'] = r2(n.cuotaIntegra);
  row['Cuota Mínimo Personal'] = r2(n.cuotaMinimoPersonal);
  row['Cuota Teórica'] = r2(n.cuotaTeorica);
  row['Deducción SMI'] = r2(n.deduccionSMI);
  row['Cuota tras SMI'] = r2(n.cuotaTrasSMI);
  row['Límite 43% (Art 85.3)'] = r2(n.limite43);
  row['IRPF Final'] = r2(n.irpfFinal);
  row['Salario Neto'] = r2(n.salarioNeto);
  return row;
}

const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);

describe('calcularNomina vs Python golden fixtures', () => {
  for (const anio of ANIOS) {
    describe(`año ${String(anio)}`, () => {
      const fixture = loadFixture(anio);
      for (const fixtureRow of fixture.rows) {
        const bruto = fixtureRow['Salario Bruto'] as number;
        it(`bruto = ${String(bruto)}`, () => {
          const actual = nominaToFixtureRow(calcularNomina(bruto, anio));
          expect(actual).toEqual(fixtureRow);
        });
      }
    });
  }
});
