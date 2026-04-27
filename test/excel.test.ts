import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFile, utils } from 'xlsx';
import { generarExcel } from '../src/excel';

// Smoke test against a small workbook (2 years, brutos 0..1000) so the
// vitest worker doesn't OOM. The full 2012-2026 × 0-100 000 generation is
// exercised end-to-end via the CLI in production.
const TEST_ANIOS = [2024, 2026];
const TEST_MAX_BRUTO = 1000;

describe('generarExcel — smoke (small workbook)', () => {
  let outDir: string;
  let xlsxPath: string;

  beforeAll(() => {
    outDir = mkdtempSync(join(tmpdir(), 'irpf-xlsx-'));
    xlsxPath = join(outDir, 'auditoria.xlsx');
    generarExcel(xlsxPath, { anios: TEST_ANIOS, maxBruto: TEST_MAX_BRUTO });
  });

  afterAll(() => {
    rmSync(outDir, { recursive: true, force: true });
  });

  it('produces 3 control sheets + 1 sheet per requested year', () => {
    const wb = readFile(xlsxPath);
    expect(wb.SheetNames).toEqual([
      'CONTROL_GENERAL',
      'CONTROL_TRAMOS_IRPF',
      'COMPARATIVA_INFLACION',
      'DAT_2024',
      'DAT_2026',
    ]);
  });

  it('CONTROL_GENERAL has one row per requested year', () => {
    const wb = readFile(xlsxPath);
    const sheet = wb.Sheets['CONTROL_GENERAL'];
    expect(sheet).toBeDefined();
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet!);
    expect(rows).toHaveLength(TEST_ANIOS.length);
    expect(rows[0]?.['Año']).toBe(2024);
    expect(rows[1]?.['Año']).toBe(2026);
  });

  it('DAT_2026 has maxBruto+1 rows starting at bruto=0', () => {
    const wb = readFile(xlsxPath);
    const sheet = wb.Sheets['DAT_2026'];
    expect(sheet).toBeDefined();
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet!);
    expect(rows).toHaveLength(TEST_MAX_BRUTO + 1);
    expect(rows[0]?.['Salario Bruto']).toBe(0);
    expect(rows[TEST_MAX_BRUTO]?.['Salario Bruto']).toBe(TEST_MAX_BRUTO);
  });

  it('COMPARATIVA_INFLACION has 86 rows × number of requested years', () => {
    const wb = readFile(xlsxPath);
    const sheet = wb.Sheets['COMPARATIVA_INFLACION'];
    expect(sheet).toBeDefined();
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet!);
    expect(rows).toHaveLength(TEST_ANIOS.length * 86);
  });
});
