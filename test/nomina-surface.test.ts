import { describe, expect, it } from 'vitest';
import { calcularNomina } from '../src/pipeline';
import { obtenerParametros } from '../src/normativa';

describe('Nomina surface — derived breakdown fields', () => {
  describe('topeAlcanzado', () => {
    it('is false when bruto <= baseMax (2024, bruto 30k)', () => {
      const n = calcularNomina(30_000, 2024);
      expect(n.topeAlcanzado).toBe(false);
    });

    it('is true when bruto > baseMax (2024, bruto well above tope)', () => {
      const p = obtenerParametros(2024);
      const n = calcularNomina(p.baseMax + 10_000, 2024);
      expect(n.topeAlcanzado).toBe(true);
    });
  });

  describe('meiTrabajador', () => {
    it('equals baseCotizacion * mei[1] for a 2024 case where MEI applies', () => {
      const p = obtenerParametros(2024);
      const bruto = 30_000;
      const baseCotizacion = Math.min(bruto, p.baseMax);
      const expected = baseCotizacion * p.mei[1];
      const n = calcularNomina(bruto, 2024);
      expect(n.meiTrabajador).toBeCloseTo(expected, 10);
    });

    it('is 0 in years without MEI (2012)', () => {
      const n = calcularNomina(30_000, 2012);
      expect(n.meiTrabajador).toBe(0);
    });
  });

  describe('solidaridadTrabajador', () => {
    it('is 0 when bruto is below baseMax', () => {
      const n = calcularNomina(30_000, 2025);
      expect(n.solidaridadTrabajador).toBe(0);
    });

    it('is positive when bruto exceeds baseMax in a year with Solidaridad', () => {
      const p = obtenerParametros(2025);
      const n = calcularNomina(p.baseMax + 20_000, 2025);
      expect(n.solidaridadTrabajador).toBeGreaterThan(0);
    });
  });

  describe('tope43Aplica', () => {
    it('is false at typical brutos where the 43% cap does not bind', () => {
      // At bruto 30k / 2024, cuotaTrasSMI ≈ 4928.70 < limite43 ≈ 6073.32.
      // (Note: at very low brutos the cap can actually bind because the
      // mínimo exento is high enough that (bruto − minExento)·0.43 stays
      // small; the algebraic test below covers all such combinations.)
      const n = calcularNomina(30_000, 2024);
      expect(n.tope43Aplica).toBe(false);
    });

    it('matches the previous epsilon comparison: cuotaTrasSMI > limite43 + 1e-6', () => {
      const sample = [10_000, 30_000, 60_000, 120_000, 250_000];
      for (const anio of [2012, 2018, 2024, 2026]) {
        for (const bruto of sample) {
          const n = calcularNomina(bruto, anio);
          const expected = n.cuotaTrasSMI > n.limite43 + 1e-6;
          expect(n.tope43Aplica).toBe(expected);
        }
      }
    });
  });
});
