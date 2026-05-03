import { describe, expect, it } from 'vitest';
import { obtenerParametros } from '../src/normativa';
import { parametrosIndexados, gapSeries } from '../src/ui/history-data';

describe('parametrosIndexados', () => {
  it('returns the year-2012 parameters unchanged at 2012 (alpha = 1)', () => {
    const indexed = parametrosIndexados(2012);
    const base = obtenerParametros(2012);
    expect(indexed.baseMax).toBe(base.baseMax);
    expect(indexed.irpfMinimo).toBe(base.irpfMinimo);
    expect(indexed.minimoExento).toBe(base.minimoExento);
    expect(indexed.gastosFijos).toBe(base.gastosFijos);
    expect(indexed.tramosIRPF.length).toBe(base.tramosIRPF.length);
    for (let i = 0; i < base.tramosIRPF.length; i++) {
      expect(indexed.tramosIRPF[i]?.hasta).toBe(base.tramosIRPF[i]?.hasta);
      expect(indexed.tramosIRPF[i]?.tipo).toBe(base.tramosIRPF[i]?.tipo);
    }
    // Probe one interior value; identity holds for any input when alpha = 1.
    expect(indexed.reduccionTrabajo(13_000)).toBeCloseTo(base.reduccionTrabajo(13_000), 10);
  });
});

import { ANIO_MIN, ANIO_MAX } from '../src/normativa';
import { inflacionAcumulada } from '../src/inflacion';

describe('parametrosIndexados scaling', () => {
  it('scales every euro field by alpha for years > 2012', () => {
    for (const anio of [2015, 2018, 2022, 2026]) {
      const base = obtenerParametros(anio);
      const indexed = parametrosIndexados(anio);
      const alpha = inflacionAcumulada(2012, anio);
      expect(indexed.baseMax).toBeCloseTo(base.baseMax * alpha, 8);
      expect(indexed.irpfMinimo).toBeCloseTo(base.irpfMinimo * alpha, 8);
      expect(indexed.minimoExento).toBeCloseTo(base.minimoExento * alpha, 8);
      expect(indexed.gastosFijos).toBeCloseTo(base.gastosFijos * alpha, 8);
      for (let i = 0; i < base.tramosIRPF.length; i++) {
        const baseHasta = base.tramosIRPF[i]?.hasta ?? 0;
        const indexedHasta = indexed.tramosIRPF[i]?.hasta ?? 0;
        if (Number.isFinite(baseHasta)) {
          expect(indexedHasta).toBeCloseTo(baseHasta * alpha, 8);
        } else {
          expect(indexedHasta).toBe(Infinity);
        }
        expect(indexed.tramosIRPF[i]?.tipo).toBe(base.tramosIRPF[i]?.tipo);
      }
    }
  });

  it('keeps rates and structure (number of brackets, MEI/Solidaridad rates) unchanged', () => {
    const base = obtenerParametros(2024);
    const indexed = parametrosIndexados(2024);
    expect(indexed.tramosIRPF.length).toBe(base.tramosIRPF.length);
    expect(indexed.mei[0]).toBe(base.mei[0]);
    expect(indexed.mei[1]).toBe(base.mei[1]);
    expect(indexed.tipoEmpresaTotal).toBe(base.tipoEmpresaTotal);
    expect(indexed.tipoTrabajadorTotal).toBe(base.tipoTrabajadorTotal);
    expect(indexed.solidaridad.length).toBe(base.solidaridad.length);
    for (let i = 0; i < base.solidaridad.length; i++) {
      expect(indexed.solidaridad[i]?.hastaMultiplicador).toBe(base.solidaridad[i]?.hastaMultiplicador);
      expect(indexed.solidaridad[i]?.tipo).toBe(base.solidaridad[i]?.tipo);
    }
  });

  it('wraps reduccionTrabajo via f_indexed(x) = alpha * f(x/alpha)', () => {
    const base = obtenerParametros(2022);
    const indexed = parametrosIndexados(2022);
    const alpha = inflacionAcumulada(2012, 2022);
    for (const x of [5_000, 10_000, 14_500, 16_000, 25_000]) {
      const expected = alpha * base.reduccionTrabajo(x / alpha);
      expect(indexed.reduccionTrabajo(x)).toBeCloseTo(expected, 8);
    }
  });

  it('wraps deduccionSMI via f_indexed(x) = alpha * f(x/alpha) for 2025 and 2026', () => {
    for (const anio of [2025, 2026]) {
      const base = obtenerParametros(anio);
      const indexed = parametrosIndexados(anio);
      const alpha = inflacionAcumulada(2012, anio);
      for (const x of [14_000, 16_000, 17_000, 20_000]) {
        const expected = alpha * base.deduccionSMI(x / alpha);
        expect(indexed.deduccionSMI(x)).toBeCloseTo(expected, 8);
      }
    }
  });
});

describe('gapSeries', () => {
  it('produces one entry per supported year (2012..ANIO_MAX)', () => {
    const s = gapSeries(30_000);
    expect(s.years.length).toBe(ANIO_MAX - ANIO_MIN + 1);
    expect(s.years[0]).toBe(ANIO_MIN);
    expect(s.years[s.years.length - 1]).toBe(ANIO_MAX);
    expect(s.netoRealActual.length).toBe(s.years.length);
    expect(s.netoRealIndexado.length).toBe(s.years.length);
    expect(s.gap.length).toBe(s.years.length);
  });

  it('has gap[0] = 0 at the base year (parametrosIndexados is identity)', () => {
    const s = gapSeries(30_000);
    expect(s.gap[0]).toBeCloseTo(0, 6);
  });

  it('exposes gapHoy = gap[last]', () => {
    const s = gapSeries(30_000);
    expect(s.gapHoy).toBe(s.gap[s.gap.length - 1]);
  });

  it('produces finite, non-NaN values for every year and every series', () => {
    const s = gapSeries(45_000);
    for (let i = 0; i < s.years.length; i++) {
      expect(Number.isFinite(s.netoRealActual[i] ?? NaN)).toBe(true);
      expect(Number.isFinite(s.netoRealIndexado[i] ?? NaN)).toBe(true);
      expect(Number.isFinite(s.gap[i] ?? NaN)).toBe(true);
    }
  });

  it('returns gap = 0 at every year for bruto = 0 (degenerate case)', () => {
    const s = gapSeries(0);
    // At bruto = 0 the pipeline returns zero neto regardless of parameters,
    // so actual and indexed real neto agree at every year and the gap is
    // identically zero — independent of the alpha scaling.
    for (const g of s.gap) {
      expect(g).toBeCloseTo(0, 6);
    }
  });
});
