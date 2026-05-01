# Cómo contribuir

Gracias por interesarte en este proyecto. Cualquier perfil aporta — fiscalistas, técnicos, divulgadores. Esta guía explica el flujo que seguimos para mantener un repositorio ordenado y auditable.

## Perfiles y áreas

Las etiquetas `area/*` indican el dominio del cambio:

| Etiqueta      | Quién                    | Aporta…                                                   |
| ------------- | ------------------------ | --------------------------------------------------------- |
| `area/fiscal` | Fiscalistas, economistas | Validación normativa contra el BOE; correcciones legales. |
| `area/engine` | Devs TypeScript          | Porting del motor, tests, refactors.                      |
| `area/ui`     | Devs web                 | SPA estática (Phase 4).                                   |
| `area/docs`   | Divulgadores             | Manual MkDocs (Phase 3).                                  |
| `area/infra`  | DevOps                   | CI, releases, GitHub Actions, deploy.                     |

Si dudas qué etiqueta corresponde, abre el issue y lo afinamos.

## Flujo de trabajo

Seguimos un flujo issue-first, branch-per-issue, PR-to-`develop`:

1. **Issue first.** No hay PRs sin issue de referencia. Crea o reclama uno con `area/…` + `type/…` y un milestone.
2. **Branch desde `develop`:** `git switch -c feat/NN-slug` (NN = número de issue, slug descriptivo en kebab-case).
3. **[Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):** prefijos `feat:`, `fix:`, `docs:`, `test:`, `ci:`, `refactor:`, `build:`, `chore:`. Un commit por cambio lógico.
4. **PR contra `develop`** usando la plantilla. Auto-review como si fueras un revisor externo.
5. **CI verde antes de merge.** Squash-merge para mantener `develop` lineal.
6. **Cierra el issue** con `Closes #NN` en el cuerpo del PR.
7. **Release PR:** cuando un milestone está completo, abre PR `develop → main`, etiqueta `vX.Y.Z`, publica GitHub Release.

## Etiquetas y milestones

Las etiquetas se aplican automáticamente vía las plantillas de issue, o manualmente durante el triaje. La taxonomía completa:

### `area/*` — dominio del cambio

Ver la tabla en [Perfiles y áreas](#perfiles-y-áreas) más arriba.

### `type/*` — naturaleza del issue

| Etiqueta          | Significado                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `type/bug`        | Comportamiento incorrecto.                                                                   |
| `type/feature`    | Nueva funcionalidad o mejora.                                                                |
| `type/audit`      | Auditoría normativa anual (`audit-YYYY`); cada issue lleva además la sublabel `audit/<año>`. |
| `type/question`   | Pregunta o aclaración.                                                                       |
| `type/discussion` | Roadmap, RFC, decisión abierta.                                                              |

### `priority/*` — prioridad relativa

| Etiqueta          | Significado      |
| ----------------- | ---------------- |
| `priority/high`   | Alta prioridad.  |
| `priority/medium` | Prioridad media. |
| `priority/low`    | Baja prioridad.  |

### Estado

| Etiqueta           | Significado                                      |
| ------------------ | ------------------------------------------------ |
| `good first issue` | Buen punto de entrada para colaboradores nuevos. |
| `help wanted`      | Se busca colaborador/a.                          |
| `blocked`          | Bloqueado por dependencia o decisión externa.    |

### Milestones

| Milestone | Fase                                                                |
| --------- | ------------------------------------------------------------------- |
| `v0.1.0`  | OSS foundation + TS tooling + correctness oracle (Python fixtures). |
| `v0.2.0`  | TypeScript engine port validado contra fixtures de v0.1.0.          |
| `v0.3.0`  | Fiscal audit workflow (15 issues `audit-YYYY` con referencias BOE). |
| `v0.4.0`  | Manual divulgativo en MkDocs (GitHub Pages).                        |
| `v1.0.0`  | Web UI: SPA estático en GitHub Pages, browser-local.                |

## Setup local

Requisitos: Node ≥ 18.18.

```bash
git clone https://github.com/ceballosiker/auditor-irpf-es.git
cd auditor-irpf-es
npm install
```

Antes de abrir un PR, asegúrate de que pasa todo:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
```

Para auto-arreglar:

```bash
npm run format
npm run lint:fix
```

## Tests

Vitest. Los tests viven bajo `test/`. Watch durante desarrollo:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

Los fixtures bajo `test/fixtures/golden_YYYY.json` son **inmutables** salvo cuando una corrección de auditoría (`audit:`) modifique un valor normativo. En ese caso el mismo PR debe regenerarlos vía `python3 legacy/python-reference/generate_fixtures.py` y documentar el motivo (referencia BOE) en el commit.

## Manual divulgativo (MkDocs)

El sitio bajo [`docs/`](docs/) se construye con MkDocs Material. Para iterar localmente:

```bash
python3 -m venv .venv-docs && .venv-docs/bin/pip install -r requirements-docs.txt
.venv-docs/bin/mkdocs serve
```

Hay dos artefactos generados desde el motor TypeScript que viven dentro de `docs/`:

- **`docs/assets/*.svg`** — gráficos para la página `progresividad-en-frio.md`. Regenerar con `npm run charts` cada vez que cambie `src/inflacion.ts`, `src/pipeline.ts` o el parámetro de un año relevante (los charts están pinned al SHA implícito del momento de la regeneración).
- **`docs/anual/YYYY.md` + `docs/anual/index.md`** — los stubs anuales con los parámetros vigentes leídos desde `obtenerParametros()`. Regenerar con `npm run anual:stubs`.

Ambos comandos son idempotentes y deterministas. Si una corrección de auditoría cambia un valor en `src/normativa.ts`, ejecuta los dos comandos en el mismo PR para que el manual no quede desincronizado del motor.

## Para fiscalistas

Hay 15 issues de auditoría abiertos, uno por año fiscal 2012–2026. La tabla agregada de progreso vive en [`docs/auditoria/progreso.md`](docs/auditoria/progreso.md) y enlaza a cada issue. Cada issue contiene un checklist normativo con permalinks al motor (`src/normativa.ts`) anclados al commit de la última release.

Para auditar un año:

1. Reclama el issue `audit-YYYY` correspondiente (etiquetas `area/fiscal` + `type/audit` + `audit/YYYY`) comentando "tomo este año".
2. Por cada ítem del checklist, valida el valor del motor contra la(s) referencia(s) BOE oficial(es) y déjalas anotadas en el campo "Referencias BOE" del issue.
3. Si todos los valores son correctos, marca los ítems y cierra el issue.
4. Si encuentras una discrepancia, abre un PR `audit:` usando la plantilla específica (`?template=audit.md` al crear el PR): corrige el valor, regenera el fixture afectado (ver sección [Tests](#tests)) y cita la referencia BOE.

**Incluye siempre la referencia legal** (BOE, artículo, disposición) cuando reportes una corrección.

## Para divulgadores

El manual divulgativo vive bajo `docs/` (a partir de v0.4.0). Lenguaje llano, ejemplos concretos, gráficos deflactados a euros constantes de 2026. Tu misión es que cualquier persona entienda qué es la _progresividad en frío_ sin abrir el código.

## Código de conducta

Este proyecto sigue el [Contributor Covenant v2.1](CODE_OF_CONDUCT.md). Por favor léelo antes de participar.
