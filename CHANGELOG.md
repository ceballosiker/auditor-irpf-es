# Changelog

Todos los cambios notables de este proyecto se documentarán aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [0.2.0] - 2026-04-27

Port del motor de cálculo desde Python a TypeScript, validado al céntimo contra los fixtures-oráculo de v0.1.0.

### Added

- Motor TypeScript completo bajo `src/`:
  - `inflacion.ts` — `IPC_ANUAL_DIC` + `inflacionAcumulada()` + `INFLACION_A_2026`.
  - `normativa.ts` — `obtenerParametros(anio)` + tablas año a año (base máx, SS, MEI, Solidaridad, IRPF, Art. 19/20, SMI), incluyendo el régimen transitorio 2018 como media de las reglas pre/post.
  - `pipeline.ts` — `calcularNomina(bruto, anio)`, función pura con la cadena fiscal de 11 pasos.
  - `bulk.ts` — `calcularAnoCompleto(anio, maxBruto)` para generación masiva.
  - `excel.ts` — `generarExcel(outputPath, opts?)` reproduce las pestañas del Python (CONTROL_GENERAL, CONTROL_TRAMOS_IRPF, COMPARATIVA_INFLACION, DAT_YYYY) vía SheetJS.
  - `format.ts` — helpers de redondeo (`r1`, `r2`, `r3`, `roundN`, `tramoLabel`) compatibles con `round()` de CPython sobre `float` Python.
  - `cli.ts` — entry point para `npm run build:excel`.
  - `types.ts` — tipos públicos (`Nomina`, `Parametros`, `TramoIRPF`, `SolidaridadBand`, `SSTipos`, `Art20Meta`, `CuotaTramo`).
- Suite de tests Vitest (664 cases): paridad con los 150 fixtures-oráculo (15 años × 10 brutos), 465 invariantes contables y normativos, smoke del Excel writer.
- Dependencia runtime `xlsx ^0.18.5` (SheetJS); dev dep `tsx ^4.21.0`.
- `npm run build:excel` produce el Excel completo en segundos.

### Changed

- `Calculo_Salario_IRPF.py` y `requirements.txt` movidos a `legacy/python-reference/`. El motor TypeScript es ahora la implementación canónica; el script Python permanece como referencia histórica y como generador de fixtures.
- README e arquitectura diagram actualizados al nuevo layout.

### Fixed

- Redondeo inconsistente en `procesar_ano` del script Python: `np.arange` producía `numpy.int64` brutos que se promovían a `numpy.float64` cuando `bruto < base_max`, disparando el redondeo bancario de numpy (vs. el redondeo true-FP de Python cuando `bruto >= base_max`). Convertido a `int` Python con `.tolist()`. 9 fixtures regenerados; los valores afectados son ahora consistentes.

## [0.1.0] - 2026-04-25

Primera release pública. Establece los cimientos para el porting del motor a TypeScript en v0.2.0.

### Added

- Infraestructura OSS: governance docs (`CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, `CHANGELOG`), plantilla de PR, plantillas de issue (`bug`, `feature`, `docs`, `audit`), `CODEOWNERS`.
- Tooling TypeScript: `package.json`, `tsconfig.json` estricto, ESLint 9 (flat config), Prettier 3, Vitest 1, `.editorconfig`, `.nvmrc` (Node 18).
- CI con GitHub Actions: `format:check` + `lint` + `typecheck` + `test` en matriz Node 18 / 20 (push y PR a `develop` y `main`).
- Fixtures JSON oráculo (`tests/fixtures/golden_YYYY.json`) generados desde el motor Python original para 10 brutos representativos × 15 años (2012–2026); inmutables durante el porting.
- `scripts/generate_fixtures.py` para regenerar los fixtures de forma idempotente desde el motor Python.
- Estado de GitHub bootstrappeado: 15 labels (`area/`, `type/`, `priority/`, status), 5 milestones (`v0.1.0` → `v1.0.0`), backlog inicial de 13 issues (1 roadmap pinneado, 5 meta-issues de fases, 7 sub-tasks de Phase 0).

### Changed

- README reformulado para reflejar la misión pública (democratizar el cálculo del IRPF), la llamada a tres perfiles colaboradores (fiscalistas, _techies_, divulgadores) y el pivote a TypeScript.

[Unreleased]: https://github.com/ceballosiker/auditor-irpf-es/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.2.0
[0.1.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.1.0
