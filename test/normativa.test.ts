import { describe, expect, it } from 'vitest';
import { obtenerParametros } from '../src/normativa';

describe('obtenerParametros — rango y forma', () => {
  it('lanza para años fuera de 2012-2026', () => {
    expect(() => obtenerParametros(2011)).toThrow();
    expect(() => obtenerParametros(2027)).toThrow();
  });

  it('devuelve Parametros completo para cada año soportado', () => {
    for (let a = 2012; a <= 2026; a++) {
      const p = obtenerParametros(a);
      expect(p.anio).toBe(a);
      expect(p.baseMax).toBeGreaterThan(0);
      expect(p.ssTipos).toBeDefined();
      expect(p.tramosIRPF.length).toBeGreaterThan(0);
      expect(typeof p.reduccionTrabajo).toBe('function');
      expect(typeof p.deduccionSMI).toBe('function');
    }
  });

  it('SS tipos son los mismos cada año (no han cambiado en 2012-2026)', () => {
    const p2012 = obtenerParametros(2012).ssTipos;
    const p2026 = obtenerParametros(2026).ssTipos;
    expect(p2026).toBe(p2012);
  });
});

describe('Bases máximas (spot checks contra Python)', () => {
  it.each([
    [2012, 39150.0],
    [2018, 45014.4],
    [2023, 53946.0],
    [2026, 61214.4],
  ])('baseMax(%i) === %f', (anio, esperado) => {
    expect(obtenerParametros(anio).baseMax).toBe(esperado);
  });
});

describe('MEI', () => {
  it('es cero antes de 2023', () => {
    for (let a = 2012; a <= 2022; a++) {
      expect(obtenerParametros(a).mei).toEqual([0, 0]);
    }
  });

  it.each([
    [2023, [0.005, 0.001]],
    [2024, [0.0058, 0.0012]],
    [2025, [0.0067, 0.0013]],
    [2026, [0.0075, 0.0015]],
  ])('MEI(%i) === %j', (anio, esperado) => {
    expect(obtenerParametros(anio).mei).toEqual(esperado);
  });
});

describe('Cuota de Solidaridad', () => {
  it('está vacía antes de 2025', () => {
    for (let a = 2012; a <= 2024; a++) {
      expect(obtenerParametros(a).solidaridad).toEqual([]);
    }
  });

  it('tiene 3 bandas en 2025 y 2026', () => {
    expect(obtenerParametros(2025).solidaridad).toHaveLength(3);
    expect(obtenerParametros(2026).solidaridad).toHaveLength(3);
  });

  it('última banda usa Infinity como límite', () => {
    const sol = obtenerParametros(2026).solidaridad;
    expect(sol[sol.length - 1]?.hastaMultiplicador).toBe(Infinity);
  });
});

describe('Mínimos personales y gastos fijos', () => {
  it('switch en frontera 2014/2015', () => {
    expect(obtenerParametros(2014).irpfMinimo).toBe(5151);
    expect(obtenerParametros(2015).irpfMinimo).toBe(5550);
    expect(obtenerParametros(2014).gastosFijos).toBe(0);
    expect(obtenerParametros(2015).gastosFijos).toBe(2000);
  });

  it.each([
    [2012, 11162],
    [2018, 12643],
    [2023, 15000],
    [2026, 15876],
  ])('minimoExento(%i) === %i', (anio, esperado) => {
    expect(obtenerParametros(anio).minimoExento).toBe(esperado);
  });
});

describe('Tramos IRPF', () => {
  it.each([
    [2014, 7],
    [2015, 5],
    [2018, 5],
    [2021, 6],
    [2026, 6],
  ])('tramosIRPF(%i) tiene %i tramos', (anio, esperado) => {
    expect(obtenerParametros(anio).tramosIRPF).toHaveLength(esperado);
  });

  it('último tramo siempre llega a Infinity', () => {
    for (let a = 2012; a <= 2026; a++) {
      const tramos = obtenerParametros(a).tramosIRPF;
      expect(tramos[tramos.length - 1]?.hasta).toBe(Infinity);
    }
  });
});

describe('Reducción Art. 20', () => {
  it('es monotónicamente no creciente para todo año', () => {
    for (let a = 2012; a <= 2026; a++) {
      const f = obtenerParametros(a).reduccionTrabajo;
      let prev = Infinity;
      for (let rn = 0; rn <= 25000; rn += 250) {
        const r = f(rn);
        expect(r).toBeLessThanOrEqual(prev + 1e-9);
        prev = r;
      }
    }
  });

  it('régimen transitorio 2018 = (regla 2017 + regla 2019) / 2', () => {
    const f2017 = obtenerParametros(2017).reduccionTrabajo;
    const f2018 = obtenerParametros(2018).reduccionTrabajo;
    const f2019 = obtenerParametros(2019).reduccionTrabajo;
    for (const rn of [5000, 10000, 12000, 14000, 15000, 17000, 25000]) {
      expect(f2018(rn)).toBeCloseTo((f2017(rn) + f2019(rn)) / 2, 6);
    }
  });
});

describe('Deducción SMI', () => {
  it('es cero antes de 2025', () => {
    for (let a = 2012; a <= 2024; a++) {
      const f = obtenerParametros(a).deduccionSMI;
      expect(f(0)).toBe(0);
      expect(f(20000)).toBe(0);
    }
  });

  it('2025: 340 € hasta 16 576, decae linealmente hasta 0 en 18 276', () => {
    const f = obtenerParametros(2025).deduccionSMI;
    expect(f(0)).toBe(340);
    expect(f(16576)).toBe(340);
    expect(f(17000)).toBeGreaterThan(0);
    expect(f(17000)).toBeLessThan(340);
    expect(f(18276)).toBeCloseTo(0, 6);
    expect(f(20000)).toBe(0);
  });

  it('2026: 590.89 € hasta 17 094, decae linealmente', () => {
    const f = obtenerParametros(2026).deduccionSMI;
    expect(f(0)).toBe(590.89);
    expect(f(17094)).toBe(590.89);
    expect(f(17500)).toBeGreaterThan(0);
    expect(f(17500)).toBeLessThan(590.89);
    expect(f(25000)).toBe(0);
  });
});

describe('Art20 metadata (para hojas de control)', () => {
  it('usa centinela "Transitorio" en 2018', () => {
    const m = obtenerParametros(2018).art20Meta;
    expect(m.uInf).toBe('Transitorio');
    expect(m.rMax).toBe('Transitorio');
    expect(m.uSup).toBe('Transitorio');
    expect(m.rMin).toBe('Transitorio');
  });

  it('coincide con Python para 2014 y 2024', () => {
    expect(obtenerParametros(2014).art20Meta).toEqual({
      uInf: 9180,
      rMax: 4080,
      uSup: 13260,
      rMin: 2652,
    });
    expect(obtenerParametros(2024).art20Meta).toEqual({
      uInf: 14852,
      rMax: 7302,
      uSup: 19747.5,
      rMin: 0,
    });
  });
});
