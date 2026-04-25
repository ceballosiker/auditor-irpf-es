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

Los fixtures bajo `tests/fixtures/golden_YYYY.json` son **inmutables** durante el porting (Phase 1). Si un cambio normativo te obliga a regenerarlos, hazlo desde el motor Python con `python3 scripts/generate_fixtures.py` y documenta el motivo en el PR (citando la referencia BOE correspondiente).

## Para fiscalistas

Si estás auditando un año, abre o reclama el issue `audit-YYYY` (etiqueta `type/audit`). Dentro encontrarás un checklist normativo a verificar. **Incluye siempre la referencia legal** (BOE, artículo, disposición) cuando reportes una corrección.

Si tu corrección modifica un valor del motor, el PR debe actualizar también los fixtures correspondientes y dejar constancia del impacto.

## Para divulgadores

El manual divulgativo vive bajo `docs/` (a partir de v0.4.0). Lenguaje llano, ejemplos concretos, gráficos deflactados a euros constantes de 2026. Tu misión es que cualquier persona entienda qué es la _progresividad en frío_ sin abrir el código.

## Código de conducta

Este proyecto sigue el [Contributor Covenant v2.1](CODE_OF_CONDUCT.md). Por favor léelo antes de participar.
