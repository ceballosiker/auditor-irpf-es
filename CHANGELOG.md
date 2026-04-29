# Changelog

Todos los cambios notables de este proyecto se documentarán aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Changed

- Manual MkDocs reubicado bajo el subpath `/manual/` (antes en la raíz). La raíz de GitHub Pages queda reservada para la calculadora interactiva (Phase 4 / `v1.0.0`); hasta entonces, una página estática redirige automáticamente a `/manual/`. `mkdocs.yml` actualiza `site_url` para que canonical URLs y sitemap reflejen la nueva ruta. `.github/workflows/docs.yml` reestructura el artefacto antes del upload (mueve `site/` a `public/manual/` y emite un `public/index.html` con `meta refresh`). README + badge apuntan a la nueva URL.

## [0.4.0] - 2026-04-29

Manual divulgativo del motor publicado en GitHub Pages: explica la cadena de cálculo paso a paso y la **progresividad en frío** en lenguaje llano, con gráficos generados desde el propio motor.

### Added

- Sitio MkDocs Material bajo `docs/`, desplegado en <https://ceballosiker.github.io/auditor-irpf-es/>:
  - `motor/01-cotizacion.md` … `motor/07-smi-y-43.md` — siete páginas trazando la cadena fiscal (cotización, SS, MEI, Solidaridad, Art. 19, Art. 20, escala IRPF + mínimo personal como cuota, deducción SMI, tope 43 %), con permalinks commit-pinned a `src/`.
  - `progresividad-en-frio.md` — concepto + ejemplo numérico con bruto nominal fijo en 30 000 € de 2012 a 2026, mostrando una caída de 6 549 € reales de neto.
  - `anual/2012.md` … `anual/2026.md` + `anual/index.md` — 15 stubs auto-generados desde `obtenerParametros()` (la redacción completa con prosa BOE llegará en v1.1.0).
  - `auditoria/progreso.md` ya existente, ahora linkeable desde el manual con columna **Manual** indicando estado de cada año.
  - `index.md`, `contribuir.md` — landing page con misión, audiencias y guía rápida por perfil.
- `scripts/render-charts.ts` — renderer SVG hand-rolled (sin Vega/Chart.js) que produce 3 gráficos para el manual a partir de `src/pipeline.ts` y `src/inflacion.ts`. Idempotente vía `npm run charts`.
- `scripts/render-anual-stubs.ts` — generador de los 15 stubs anuales desde `obtenerParametros()`. Idempotente vía `npm run anual:stubs`. Encadena `prettier --write` para que la salida sea siempre prettier-clean.
- `.github/workflows/docs.yml` — workflow GitHub Pages: `mkdocs build --strict` en cada PR a `develop`/`main`; deploy vía `actions/deploy-pages@v4` en push a `main`. Concurrency group `pages` con `cancel-in-progress: false`.
- `requirements-docs.txt` — `mkdocs 1.6.1`, `mkdocs-material 9.5.49`, `pymdown-extensions 10.12` (pinned).
- `mkdocs.yml` — tema Material, paleta light/dark, `repo_url`, `edit_uri` apuntando a `develop/docs/`, navegación completa.

### Changed

- README — nuevo aviso de una línea sobre el doble propósito del repo (proyecto + práctica de flujos OSS asistidos por agente). Sección "Manual divulgativo" con enlace al sitio publicado. Estado actualizado a v0.4.0. Roadmap añade fila para `v1.1.0` (redacción completa de los anuales). Árbol de arquitectura incluye `docs/` y los scripts nuevos.
- `eslint.config.js` — añade `.venv-*/` y `site/` a ignores para que `npm run lint` no se rompa en local cuando existen artefactos de mkdocs.
- `docs/auditoria/progreso.md` — nueva columna **Manual** marcando el estado (`stub` / `redactado`) de cada `anual/YYYY.md`.

### Removed

- `SECURITY.md` — era un stub de una tabla sin contenido real; para un repo pre-1.0 educativo no aporta valor.

## [0.3.0] - 2026-04-27

Workflow de auditoría fiscal año a año: 15 issues `audit-YYYY` con checklist normativo + referencias BOE, abriendo la puerta a fiscalistas no-técnicos.

### Added

- 15 issues de auditoría (`audit-2012` … `audit-2026`, #17–#31) etiquetados `area/fiscal` + `type/audit` + `audit/<year>`. Cada issue lleva checklist por elemento (base máx, tipos SS, MEI, Solidaridad, escala IRPF, gastos Art. 19, reducción Art. 20, mínimo personal, mínimo exento, tope 43 %, deducción SMI) con permalinks al motor anclados al SHA de v0.2.0.
- `docs/auditoria/progreso.md` — tabla agregada de progreso 2012–2026 enlazando a cada issue, con columnas para los elementos opcionales (MEI 2023+, Solidaridad 2025+, SMI 2025+).
- `.github/PULL_REQUEST_TEMPLATE/audit.md` — plantilla específica para PRs `audit:` (correcciones normativas), accesible vía `?template=audit.md`. Incluye sección para referencia BOE y casillas que recuerdan la regeneración del fixture afectado.

### Changed

- README y `CONTRIBUTING.md` actualizados con la guía del workflow de auditoría: cómo reclamar un año, cómo validar contra el BOE, cómo abrir un PR `audit:` cuando se detecta una discrepancia.

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

[Unreleased]: https://github.com/ceballosiker/auditor-irpf-es/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.4.0
[0.3.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.3.0
[0.2.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.2.0
[0.1.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.1.0
