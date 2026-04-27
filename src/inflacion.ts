// Inflación acumulada (IPC oficial INE, diciembre a diciembre).
//
// Los datos cubren 2013–2026. El año 2012 se usa como base inicial pero su
// IPC propio nunca entra en el cálculo: siempre encadenamos desde el año
// siguiente al base hasta el destino.

export const IPC_ANUAL_DIC: Readonly<Record<number, number>> = {
  2013: 0.003,
  2014: -0.01,
  2015: 0.0,
  2016: 0.016,
  2017: 0.011,
  2018: 0.012,
  2019: 0.008,
  2020: -0.005,
  2021: 0.065,
  2022: 0.057,
  2023: 0.031,
  2024: 0.028,
  2025: 0.029,
  2026: 0.03,
};

/**
 * Multiplicador acumulado del IPC de `anioBase` a `anioDestino` (default 2026).
 * Encadena (1 + IPC[a]) para `a` en (anioBase, anioDestino].
 */
export function inflacionAcumulada(anioBase: number, anioDestino = 2026): number {
  if (anioBase === anioDestino) return 1;
  let mult = 1;
  for (let a = anioBase + 1; a <= anioDestino; a++) {
    const ipc = IPC_ANUAL_DIC[a];
    if (ipc === undefined) {
      throw new Error(`No hay IPC para el año ${String(a)}`);
    }
    mult *= 1 + ipc;
  }
  return mult;
}

/** Multiplicadores precomputados desde cada año 2012–2026 hasta 2026. */
export const INFLACION_A_2026: Readonly<Record<number, number>> = (() => {
  const out: Record<number, number> = {};
  for (let a = 2012; a <= 2026; a++) {
    out[a] = inflacionAcumulada(a, 2026);
  }
  return out;
})();
