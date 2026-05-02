import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { nominaToFila } from '../src/format';
import { ANIOS_SOPORTADOS } from '../src/normativa';
import { calcularNomina } from '../src/pipeline';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(HERE, 'fixtures');

type FixtureRow = Record<string, number>;
interface Fixture {
  anio: number;
  rows: FixtureRow[];
}

function loadFixture(anio: number): Fixture {
  const path = join(FIXTURES_DIR, `golden_${String(anio)}.json`);
  return JSON.parse(readFileSync(path, 'utf-8')) as Fixture;
}

describe('calcularNomina vs Python golden fixtures', () => {
  for (const anio of ANIOS_SOPORTADOS) {
    describe(`año ${String(anio)}`, () => {
      const fixture = loadFixture(anio);
      for (const fixtureRow of fixture.rows) {
        const bruto = fixtureRow['Salario Bruto'] as number;
        it(`bruto = ${String(bruto)}`, () => {
          const actual = nominaToFila(calcularNomina(bruto, anio));
          expect(actual).toEqual(fixtureRow);
        });
      }
    });
  }
});
