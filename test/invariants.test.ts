import { describe, expect, it } from 'vitest';
import { obtenerParametros } from '../src/normativa';
import { calcularNomina } from '../src/pipeline';

const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);
const BRUTOS = [0, 5000, 12000, 18000, 25000, 40000, 60000, 80000, 100000, 200000];

describe('invariantes contables y normativos', () => {
  for (const anio of ANIOS) {
    describe(`año ${String(anio)}`, () => {
      const p = obtenerParametros(anio);

      for (const bruto of BRUTOS) {
        it(`bruto=${String(bruto)}: identidad neto + cot_trab + irpf == bruto`, () => {
          const n = calcularNomina(bruto, anio);
          expect(n.salarioNeto + n.cotSocTrabajador + n.irpfFinal).toBeCloseTo(bruto, 6);
        });

        it(`bruto=${String(bruto)}: irpfFinal ≤ 43 % × max(0, bruto − mínimoExento)`, () => {
          const n = calcularNomina(bruto, anio);
          const cap = Math.max(0, (bruto - p.minimoExento) * 0.43);
          expect(n.irpfFinal).toBeLessThanOrEqual(cap + 1e-6);
        });

        it(`bruto=${String(bruto)}: baseImponible ≥ 0`, () => {
          const n = calcularNomina(bruto, anio);
          expect(n.baseImponible).toBeGreaterThanOrEqual(0);
        });
      }

      it('cuota Solidaridad efectivamente nula cuando bruto ≤ baseMax', () => {
        // Comparar cot empresa "real" (con eventual cuota Solidaridad) con la
        // versión pura: si bruto ≤ baseMax, no hay exceso, luego no hay cuota
        // Solidaridad y la cotización debe coincidir con base × tipo total.
        const bruto = p.baseMax - 1;
        const n = calcularNomina(bruto, anio);
        const tipoEmp =
          p.ssTipos.comunes[0] +
          p.ssTipos.desempleo[0] +
          p.ssTipos.fogasa[0] +
          p.ssTipos.fp[0] +
          p.ssTipos.atep[0] +
          p.mei[0];
        const tipoTra =
          p.ssTipos.comunes[1] +
          p.ssTipos.desempleo[1] +
          p.ssTipos.fogasa[1] +
          p.ssTipos.fp[1] +
          p.ssTipos.atep[1] +
          p.mei[1];
        expect(n.cotSocEmpresa).toBeCloseTo(bruto * tipoEmp, 6);
        expect(n.cotSocTrabajador).toBeCloseTo(bruto * tipoTra, 6);
      });
    });
  }
});
