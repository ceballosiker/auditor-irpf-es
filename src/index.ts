// Public API barrel for the auditor-irpf-es engine.

export const VERSION = '1.1.0';

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
export { ANIO_MIN, ANIO_MAX, ANIOS_SOPORTADOS, obtenerParametros } from './normativa';
export { calcularNomina, calcularNominaConParametros } from './pipeline';
export { calcularAnoCompleto } from './bulk';
export { generarExcel, generarExcelBlob, generarWorkbook } from './excel';
