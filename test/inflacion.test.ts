import { describe, expect, it } from 'vitest';
import { IPC_ANUAL_DIC, INFLACION_A_2026, inflacionAcumulada } from '../src/inflacion';

describe('inflacionAcumulada', () => {
  it('returns 1 when base year equals destination year', () => {
    expect(inflacionAcumulada(2026, 2026)).toBe(1);
    expect(inflacionAcumulada(2012, 2012)).toBe(1);
  });

  it('multiplies by (1 + IPC) for each step', () => {
    expect(inflacionAcumulada(2025, 2026)).toBeCloseTo(1.03, 10);
    expect(inflacionAcumulada(2024, 2026)).toBeCloseTo(1.029 * 1.03, 10);
    expect(inflacionAcumulada(2023, 2026)).toBeCloseTo(1.028 * 1.029 * 1.03, 10);
  });

  it('handles negative IPC steps (deflation)', () => {
    // 2014 IPC = -0.010 -> chain 2013 to 2014 = 0.990
    expect(inflacionAcumulada(2013, 2014)).toBeCloseTo(0.99, 10);
    expect(inflacionAcumulada(2013, 2014)).toBeLessThan(1);
  });

  it('throws if any intermediate year lacks IPC data', () => {
    expect(() => inflacionAcumulada(2010, 2026)).toThrow(/No hay IPC/);
    expect(() => inflacionAcumulada(2026, 2027)).toThrow(/No hay IPC/);
  });
});

describe('IPC_ANUAL_DIC', () => {
  it('covers 2013..2026 (no entry for 2012, the base year)', () => {
    expect(IPC_ANUAL_DIC[2012]).toBeUndefined();
    for (let a = 2013; a <= 2026; a++) {
      expect(IPC_ANUAL_DIC[a]).toBeDefined();
    }
  });
});

describe('INFLACION_A_2026', () => {
  it('has entries for every year 2012..2026', () => {
    for (let a = 2012; a <= 2026; a++) {
      expect(INFLACION_A_2026[a]).toBeDefined();
    }
  });

  it('is exactly 1 for 2026', () => {
    expect(INFLACION_A_2026[2026]).toBe(1);
  });

  it('matches a manual chain for a known year', () => {
    const expected = inflacionAcumulada(2024, 2026);
    expect(INFLACION_A_2026[2024]).toBeCloseTo(expected, 10);
  });

  it('reflects the cumulative deflation 2012->2026 (>1.3, <1.5)', () => {
    const m = INFLACION_A_2026[2012];
    expect(m).toBeGreaterThan(1.3);
    expect(m).toBeLessThan(1.5);
  });
});
