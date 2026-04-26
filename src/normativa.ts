// Normativa fiscal y laboral año a año (2012-2026).
//
// Punto único de verdad de las constantes y reglas piecewise: bases máximas
// de cotización, tipos SS, MEI, Cuota de Solidaridad, mínimo personal,
// mínimo exento, gastos fijos Art. 19, reducción Art. 20 (con régimen
// transitorio 2018), escala IRPF y deducción SMI.

import type { Art20Meta, Parametros, SolidaridadBand, SSTipos, TramoIRPF } from './types';

const ANIO_MIN = 2012;
const ANIO_MAX = 2026;

const BASE_MAX_POR_ANIO: Readonly<Record<number, number>> = {
  2012: 39150.0,
  2013: 41108.4,
  2014: 43164.0,
  2015: 43272.0,
  2016: 43704.0,
  2017: 45014.4,
  2018: 45014.4,
  2019: 48841.2,
  2020: 48841.2,
  2021: 48841.2,
  2022: 49672.8,
  2023: 53946.0,
  2024: 56646.0,
  2025: 58914.0,
  2026: 61214.4,
};

const SS_TIPOS: SSTipos = {
  comunes: [0.236, 0.047],
  desempleo: [0.055, 0.0155],
  fogasa: [0.002, 0.0],
  fp: [0.006, 0.001],
  atep: [0.015, 0.0],
};

const MINIMO_EXENTO_POR_ANIO: Readonly<Record<number, number>> = {
  2012: 11162,
  2013: 11162,
  2014: 11162,
  2015: 12000,
  2016: 12000,
  2017: 12000,
  2018: 12643,
  2019: 14000,
  2020: 14000,
  2021: 14000,
  2022: 14000,
  2023: 15000,
  2024: 15876,
  2025: 15876,
  2026: 15876,
};

function meiDe(anio: number): readonly [number, number] {
  if (anio === 2023) return [0.005, 0.001];
  if (anio === 2024) return [0.0058, 0.0012];
  if (anio === 2025) return [0.0067, 0.0013];
  if (anio >= 2026) return [0.0075, 0.0015];
  return [0, 0];
}

function solidaridadDe(anio: number): readonly SolidaridadBand[] {
  if (anio === 2025) {
    return [
      { hastaMultiplicador: 1.1, tipo: 0.0092 },
      { hastaMultiplicador: 1.5, tipo: 0.01 },
      { hastaMultiplicador: Infinity, tipo: 0.0117 },
    ];
  }
  if (anio >= 2026) {
    return [
      { hastaMultiplicador: 1.1, tipo: 0.0115 },
      { hastaMultiplicador: 1.5, tipo: 0.0125 },
      { hastaMultiplicador: Infinity, tipo: 0.0146 },
    ];
  }
  return [];
}

function art20MetaDe(anio: number): Art20Meta {
  if (anio <= 2014) return { uInf: 9180, rMax: 4080, uSup: 13260, rMin: 2652 };
  if (anio <= 2017) return { uInf: 11250, rMax: 3700, uSup: 14450, rMin: 0 };
  if (anio === 2018) {
    return { uInf: 'Transitorio', rMax: 'Transitorio', uSup: 'Transitorio', rMin: 'Transitorio' };
  }
  if (anio <= 2022) return { uInf: 13115, rMax: 5565, uSup: 16825, rMin: 0 };
  if (anio === 2023) return { uInf: 14047.5, rMax: 6498, uSup: 19747.5, rMin: 0 };
  return { uInf: 14852, rMax: 7302, uSup: 19747.5, rMin: 0 };
}

function reduccionTrabajoDe(anio: number): (rnPrevio: number) => number {
  if (anio <= 2014) {
    return (rn) => {
      if (rn <= 9180) return 4080;
      if (rn <= 13260) return 4080 - 0.35 * (rn - 9180);
      return 2652;
    };
  }
  if (anio <= 2017) {
    return (rn) => {
      if (rn <= 11250) return 3700;
      if (rn <= 14450) return 3700 - 1.15625 * (rn - 11250);
      return 0;
    };
  }
  if (anio === 2018) {
    // Régimen transitorio (Disp. Ad. 47ª LIRPF): media de la regla previa y la nueva.
    return (rn) => {
      const pre = rn <= 11250 ? 3700 : rn <= 14450 ? 3700 - 1.15625 * (rn - 11250) : 0;
      const post = rn <= 13115 ? 5565 : rn <= 16825 ? Math.max(0, 5565 - 1.5 * (rn - 13115)) : 0;
      return pre / 2 + post / 2;
    };
  }
  if (anio <= 2022) {
    return (rn) => {
      if (rn <= 13115) return 5565;
      if (rn <= 16825) return Math.max(0, 5565 - 1.5 * (rn - 13115));
      return 0;
    };
  }
  if (anio === 2023) {
    return (rn) => {
      if (rn <= 14047.5) return 6498;
      if (rn <= 19747.5) return Math.max(0, 6498 - 1.14 * (rn - 14047.5));
      return 0;
    };
  }
  // 2024+
  return (rn) => {
    if (rn <= 14852) return 7302;
    if (rn <= 17673.52) return 7302 - 1.75 * (rn - 14852);
    if (rn <= 19747.5) return 2364.34 - 1.14 * (rn - 17673.52);
    return 0;
  };
}

function tramosIRPFDe(anio: number): readonly TramoIRPF[] {
  if (anio <= 2014) {
    return [
      { hasta: 17707, tipo: 0.2475 },
      { hasta: 33007, tipo: 0.3 },
      { hasta: 53407, tipo: 0.4 },
      { hasta: 120000, tipo: 0.47 },
      { hasta: 175000, tipo: 0.49 },
      { hasta: 300000, tipo: 0.51 },
      { hasta: Infinity, tipo: 0.52 },
    ];
  }
  if (anio === 2015) {
    return [
      { hasta: 12450, tipo: 0.195 },
      { hasta: 20200, tipo: 0.245 },
      { hasta: 34000, tipo: 0.305 },
      { hasta: 60000, tipo: 0.38 },
      { hasta: Infinity, tipo: 0.46 },
    ];
  }
  if (anio <= 2020) {
    return [
      { hasta: 12450, tipo: 0.19 },
      { hasta: 20200, tipo: 0.24 },
      { hasta: 35200, tipo: 0.3 },
      { hasta: 60000, tipo: 0.37 },
      { hasta: Infinity, tipo: 0.45 },
    ];
  }
  return [
    { hasta: 12450, tipo: 0.19 },
    { hasta: 20200, tipo: 0.24 },
    { hasta: 35200, tipo: 0.3 },
    { hasta: 60000, tipo: 0.37 },
    { hasta: 300000, tipo: 0.45 },
    { hasta: Infinity, tipo: 0.47 },
  ];
}

function deduccionSMIDe(anio: number): (bruto: number) => number {
  if (anio === 2026) {
    return (bruto) => {
      if (bruto <= 17094) return 590.89;
      return Math.max(0, 590.89 - 0.2 * (bruto - 17094));
    };
  }
  if (anio === 2025) {
    return (bruto) => {
      if (bruto <= 16576) return 340;
      if (bruto <= 18276) return Math.max(0, 340 - 0.2 * (bruto - 16576));
      return 0;
    };
  }
  return () => 0;
}

/**
 * Devuelve los parámetros normativos completos para `anio` ∈ [2012, 2026].
 * Lanza si el año está fuera del rango soportado.
 */
export function obtenerParametros(anio: number): Parametros {
  const baseMax = BASE_MAX_POR_ANIO[anio];
  const minimoExento = MINIMO_EXENTO_POR_ANIO[anio];
  if (baseMax === undefined || minimoExento === undefined) {
    throw new Error(
      `Año fuera de rango (${String(ANIO_MIN)}-${String(ANIO_MAX)}): ${String(anio)}`,
    );
  }
  return {
    anio,
    baseMax,
    ssTipos: SS_TIPOS,
    mei: meiDe(anio),
    solidaridad: solidaridadDe(anio),
    irpfMinimo: anio <= 2014 ? 5151 : 5550,
    minimoExento,
    gastosFijos: anio <= 2014 ? 0 : 2000,
    art20Meta: art20MetaDe(anio),
    tramosIRPF: tramosIRPFDe(anio),
    reduccionTrabajo: reduccionTrabajoDe(anio),
    deduccionSMI: deduccionSMIDe(anio),
  };
}
