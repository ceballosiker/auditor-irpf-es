// Public API barrel for the auditor-irpf-es engine.

export const VERSION = '0.1.0';

export type {
  Art20Meta,
  Art20Number,
  CuotaTramo,
  Nomina,
  Parametros,
  SolidaridadBand,
  SSTipos,
  TramoIRPF,
} from './types';

export { IPC_ANUAL_DIC, INFLACION_A_2026, inflacionAcumulada } from './inflacion';
export { obtenerParametros } from './normativa';
export { calcularNomina } from './pipeline';
export { calcularAnoCompleto } from './bulk';
export { generarExcel } from './excel';
export { r1, r2, r3, roundN, tramoLabel } from './format';
