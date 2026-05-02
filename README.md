# 💶 Auditor Histórico de Nóminas e IRPF (España 2012–2026) con Ajuste de Inflación

![TypeScript](https://img.shields.io/badge/typescript-5.5%2B-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.18-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Estado](https://img.shields.io/badge/estado-v1.0.0-brightgreen.svg)
[![Calculadora](https://img.shields.io/badge/calculadora-ceballosiker.github.io-blue.svg)](https://ceballosiker.github.io/auditor-irpf-es/)
[![Manual](https://img.shields.io/badge/manual-ceballosiker.github.io%2Fmanual-blue.svg)](https://ceballosiker.github.io/auditor-irpf-es/manual/)

> [!WARNING]
> **Este repositorio es ante todo un experimento de flujos OSS asistidos por agentes de IA** (Claude Code): el código y los cálculos son reales, pero la motivación primaria es metodológica — practicar issues, branches, PRs, releases y CI con un agente como _pair programmer_.

Auditor fiscal que calcula el salario neto en España (2012–2026): IRPF, Seguridad Social, MEI y Cuota de Solidaridad, con análisis de pérdida de poder adquisitivo ajustada a la inflación real (IPC oficial del INE). Se expone como una **calculadora interactiva 100 % en el navegador** (sin servidor) acompañada de un manual divulgativo y un proceso de auditoría pública año a año.

> **Estado actual (v1.0.0):** motor TypeScript validado contra los fixtures del motor Python de referencia, **calculadora web interactiva en producción** y manual divulgativo publicados en GitHub Pages, auditoría axe-core (WCAG 2.1 AA) + thresholds Lighthouse (perf ≥ 0.85, a11y ≥ 0.95) bloqueando cada PR. Próximo hito (`v1.1.0`): redacción completa de los 15 resúmenes anuales junto con la auditoría fiscal.

## 🧮 Calculadora interactiva

Disponible en **<https://ceballosiker.github.io/auditor-irpf-es/>** — escribe un bruto, elige un año entre 2012 y 2026 y obtén el desglose completo (cotización social, MEI/Solidaridad, IRPF tramo a tramo, mínimo personal aplicado como cuota, tope 43 %, deducción SMI) más la curva de pérdida de poder adquisitivo deflactada a euros de 2026. El botón "Descargar Excel" genera el libro `.xlsx` completo en el navegador, sin red. Cero telemetría, cero cookies, cero servidor.

## 📖 Manual divulgativo

El manual está publicado en **<https://ceballosiker.github.io/auditor-irpf-es/manual/>**. Contiene siete páginas explicando paso a paso la cadena de cálculo (cotización, SS, MEI/Solidaridad, Art. 19/20, escala IRPF, SMI/tope 43 %), una página dedicada a la **progresividad en frío** con gráficos generados desde el propio motor, y un esqueleto de 15 resúmenes anuales (uno por año entre 2012 y 2026) cuya redacción completa irá llegando en `v1.1.0` en paralelo con la auditoría fiscal.

---

## 🎯 Misión del proyecto

> **Democratizar el conocimiento del cálculo del IRPF y del salario neto, y las implicaciones de la progresividad en frío entre 2012 y 2026.**

Este repositorio es una implementación pública y auditable del cálculo de nómina española. El objetivo a medio plazo es triple:

1. **Un motor de cálculo revisado por pares** — TypeScript, validado contra fixtures generados desde el motor Python original, auditado por fiscalistas.
2. **Un manual divulgativo** que explique en lenguaje llano cada cambio normativo y su impacto real sobre el bolsillo.
3. **Una web pública e interactiva** ejecutándose enteramente en el navegador (sin backend), servida desde GitHub Pages.

## 🤝 Llamada a colaboradores

Busco tres perfiles. Si te identificas con alguno, abre una _issue_ o un PR indicándolo:

- **🧾 Fiscalistas y economistas** — audita los resultados año a año al mínimo detalle. ¿Falta un matiz normativo? ¿Un redondeo oficial distinto? ¿Una interacción entre Art. 19 y Art. 20 mal secuenciada? Dímelo. La precisión legal es la prioridad número uno.
- **💻 Techies (TypeScript / web)** — motor en TS, suite de tests con Vitest, ESLint/Prettier, CI con GitHub Actions, y la SPA (HTML + Chart.js + SheetJS). React queda explícitamente fuera; el stack es deliberadamente _vanilla_.
- **🌐 Diseño / UX** — accesibilidad sólida (axe-core en CI, Lighthouse a11y ≥ 0.95 ya verificado), UI clara y móvil-first, sin telemetría ni cookies. Mejoras visuales y de UX bienvenidas vía issue/PR.

También es muy bienvenida la contribución de **redactores divulgativos** que extraigan, a partir del código, un manual sencillo que explique:

- Qué calcula cada paso de la nómina.
- Qué cambió en cada año normativo (2015, 2018, 2023, 2025, 2026…) y por qué.
- Qué es la progresividad en frío y cómo se manifiesta en los resultados.

## 🧭 Alcance actual (supuesto simplificado)

Para maximizar la precisión antes de ampliar casuística, el motor modela deliberadamente un único perfil:

- **Situación personal:** soltero/a, sin hijos, sin discapacidad.
- **Tramo autonómico = tramo estatal** (se duplica la escala estatal; no se modelan particularidades por CCAA).

### 🎚️ Precisión normativa ya incorporada

- **📜 Histórico 2012–2026:** bases máximas de cotización, tipos SS, reducciones, gastos fijos y escalas de IRPF.
- **Régimen transitorio de 2018** para la Reducción por Rendimientos del Trabajo (Disp. Ad. 47ª LIRPF), como promedio de la normativa pre y post-reforma.
- **Reducción Art. 20** calculada sobre el rendimiento neto previo, separada correctamente de los gastos deducibles generales (Art. 19).
- **Mínimo personal** aplicado como cuota (tipo del primer tramo), no como reducción de la base.
- **Tope legal de retención del 43 %** sobre `(bruto − mínimo exento)` (Art. 85.3 RIRPF).
- **MEI** (desde 2023) y **Cuota de Solidaridad** progresiva (desde 2025, actualizada a tipos de 2026), con reparto 5/6 empresa · 1/6 trabajador.
- **Deducción SMI** actualizada para 2025 y 2026.
- **Inflación real** encadenada con el IPC oficial del INE (diciembre a diciembre).

## 🗺️ Hoja de ruta

### Hoja de ruta de desarrollo

| Versión       | Hito                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| **v0.1.0** ✅ | Infraestructura OSS, tooling TypeScript, fixtures JSON desde el motor Python (oráculo).                      |
| **v0.2.0** ✅ | Port del motor a TypeScript validado contra los fixtures generados de v0.1.0.                                |
| **v0.3.0** ✅ | Workflow de auditoría fiscal: 15 issues (uno por año, 2012–2026) con checklist normativo + referencias BOE.  |
| **v0.4.0** ✅ | Manual divulgativo en MkDocs Material publicado en GitHub Pages.                                             |
| **v1.0.0** ✅ | Calculadora web interactiva: SPA estático, 100 % en el navegador, GitHub Pages. axe-core + Lighthouse en CI. |
| **v1.1.0**    | Redacción completa de los 15 resúmenes anuales con referencias BOE, en paralelo con los `audit-YYYY`.        |

Sigue el progreso en los [issues abiertos](https://github.com/ceballosiker/auditor-irpf-es/issues) y [milestones](https://github.com/ceballosiker/auditor-irpf-es/milestones).

### Hoja de ruta normativa (post-v1.1)

- Tramos autonómicos específicos por Comunidad Autónoma.
- Deducciones familiares (hijos, ascendientes, discapacidad).
- Deducciones por edad.

## 🚀 Instalación y uso

### TypeScript (motor principal)

```bash
git clone https://github.com/ceballosiker/auditor-irpf-es.git
cd auditor-irpf-es
npm install
npm test               # Vitest (664 tests)
npm run test:browser   # axe-core a11y (Vitest browser project, requiere Chromium)
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run dev            # Vite dev server — la calculadora en http://localhost:5173
npm run build          # Bundle estático en dist/ (sirve cualquier subpath)
npm run build:excel    # Genera el Excel completo (15 años × 0-100 000 €) por CLI
npm run lighthouse     # Build + Lighthouse CI (3 corridas, asserts perf/a11y/bp/seo)
```

Requisitos: Node ≥ 18.18. Los tests browser y `lighthouse` requieren Chromium en el sistema (Playwright lo instala automáticamente con `npx playwright install chromium`).

### Python (motor original — archivado en `legacy/`)

El script Python original vive bajo `legacy/python-reference/` como referencia histórica y como generador de los fixtures-oráculo. Sigue siendo ejecutable:

```bash
python3 -m venv .venv
.venv/bin/pip install -r legacy/python-reference/requirements.txt
.venv/bin/python3 legacy/python-reference/Calculo_Salario_IRPF.py
```

Para regenerar los fixtures JSON (operación idempotente):

```bash
.venv/bin/python3 legacy/python-reference/generate_fixtures.py
```

> ⏳ El motor TypeScript genera el mismo Excel en segundos vía SheetJS; el script Python tarda minutos por el volumen de cálculos.

## 📊 Entendiendo el output (Excel generado)

`npm run build:excel` (TS) y `python3 legacy/python-reference/Calculo_Salario_IRPF.py` (Python) producen el mismo `Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx` con estas pestañas:

| Pestaña                 | Qué contiene                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CONTROL_GENERAL`       | Diccionario normativo anual: tipos SS, MEI, mínimos, gastos fijos, umbrales del Art. 20.                                                                                                               |
| `CONTROL_TRAMOS_IRPF`   | Histórico de tramos y tipos de IRPF de cada año.                                                                                                                                                       |
| `COMPARATIVA_INFLACION` | Análisis macroeconómico: cuánto poder adquisitivo ha perdido un salario frente a su equivalente pasado, deflactando el bruto y actualizando todos los impuestos.                                       |
| `DAT_2012` … `DAT_2026` | Pestañas anuales con una fila por cada bruto entero (0 €–100.000 €): coste laboral, cotizaciones patronales/obreras, cuota por cada tramo de IRPF, aplicación de límites legales y salario neto final. |

## 🏗️ Arquitectura

```
.
├── src/                          # Motor TypeScript
│   ├── inflacion.ts              # IPC + inflacionAcumulada
│   ├── normativa.ts              # obtenerParametros + tablas año a año
│   ├── pipeline.ts               # calcularNomina (motor central)
│   ├── bulk.ts                   # calcularAnoCompleto (brutos 0-100 000)
│   ├── excel.ts                  # generarExcel (vía SheetJS)
│   ├── format.ts                 # Helpers de redondeo Python-compatibles
│   ├── types.ts                  # Tipos públicos
│   ├── cli.ts                    # Entry point para `npm run build:excel`
│   └── index.ts                  # Public API barrel
├── test/                         # Vitest (664 cases: fixtures + invariantes + smoke)
│   └── fixtures/                 # Golden JSON fixtures: oráculo inmutable
│       └── golden_YYYY.json      # 10 brutos representativos por año (2012-2026)
├── docs/                         # Manual MkDocs Material (GitHub Pages)
│   ├── index.md, contribuir.md
│   ├── motor/                    # 7 páginas: cadena de cálculo paso a paso
│   ├── progresividad-en-frio.md  # Concepto + gráficos generados del motor
│   ├── anual/                    # Stubs 2012-2026 (redacción completa en v1.1.0)
│   ├── auditoria/progreso.md     # Estado de los 15 audit-YYYY
│   └── assets/*.svg              # Charts hand-rolled desde src/pipeline.ts
├── scripts/
│   ├── render-charts.ts          # `npm run charts` — SVGs para el manual
│   └── render-anual-stubs.ts     # `npm run anual:stubs` — stubs anuales
├── legacy/python-reference/      # Mundo Python: motor original + regenerador
│   ├── Calculo_Salario_IRPF.py   # Motor Python original (archivado tras v0.2.0)
│   ├── generate_fixtures.py      # Regenera fixtures desde el motor Python
│   └── requirements.txt
└── package.json                  # npm + Vite + Vitest + ESLint + Prettier + xlsx
```

Punto único de verdad normativa: `obtenerParametros(anio)` en `src/normativa.ts`. Cualquier actualización de ley se centraliza ahí.

## 🤝 Contribuciones

Si detectas una actualización normativa, un error en los parámetros oficiales o quieres añadir funcionalidad:

1. Abre o reclama una _issue_ (etiquetas `area/…` + `type/…` y un milestone).
2. Crea una rama desde `develop`: `git switch -c feat/NN-mi-feature` (donde `NN` es el número de issue).
3. Sigue [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat:`, `fix:`, `docs:`, `test:`, `ci:`, `refactor:`, `build:`, `chore:`).
4. Asegúrate de que `npm run lint && npm run typecheck && npm test` queden verdes.
5. Abre un _Pull Request_ contra `develop` indicando el perfil del aporte (fiscal / código / web / divulgación).

Para auditorías normativas, **incluye siempre la referencia legal** (BOE, artículo, disposición).

## ⚖️ Aviso legal

Este proyecto tiene fines educativos, divulgativos y de análisis económico. Aunque el algoritmo sigue minuciosamente la normativa de la AEAT y la Seguridad Social española, los resultados son orientativos y no sustituyen el consejo de un profesional fiscal o un graduado social.

## 📝 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE`.
