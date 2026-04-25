# Changelog

Todos los cambios notables de este proyecto se documentarán aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

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

[Unreleased]: https://github.com/ceballosiker/auditor-irpf-es/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.1.0
