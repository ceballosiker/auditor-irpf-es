import { describe, expect, it } from 'vitest';
import { calcularAnoCompleto } from '../src/bulk';
import { calcularNomina } from '../src/pipeline';

describe('calcularAnoCompleto', () => {
  it('returns 100001 entries indexed by bruto for 2024', () => {
    const out = calcularAnoCompleto(2024);
    expect(out).toHaveLength(100001);
    expect(out[0]?.bruto).toBe(0);
    expect(out[100000]?.bruto).toBe(100000);
    expect(out[45000]?.bruto).toBe(45000);
  });

  it('matches calcularNomina(bruto, anio) at random brutos for 2024', () => {
    const completo = calcularAnoCompleto(2024);
    for (const bruto of [0, 12000, 18000, 45000, 60000, 100000]) {
      const ref = calcularNomina(bruto, 2024);
      expect(completo[bruto]).toEqual(ref);
    }
  });
});
