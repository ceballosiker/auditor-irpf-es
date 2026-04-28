# Cómo contribuir

Este proyecto necesita tres tipos de aportación. Elige tu perfil:

## Si eres fiscalista o economista

Tu valor está en **validar la fidelidad normativa** del motor año a año.

1. Mira la [tabla de progreso de auditoría](auditoria/progreso.md).
2. Elige un año en estado *no iniciado*.
3. Abre el issue `audit-YYYY` correspondiente y reclama el slot comentando "tomo este año".
4. Para cada ítem del checklist, valida el valor en `src/normativa.ts` (o `src/pipeline.ts` para el tope 43 %) contra la referencia BOE oficial.
5. Si el valor es correcto, marca el ítem y deja la(s) referencia(s) BOE en el issue.
6. Si encuentras una discrepancia, abre un issue describiéndola y un *techie* la convertirá en un PR `audit:` con la corrección + actualización del fixture afectado.

No necesitas saber programar para auditar; basta con saber leer normativa y citar BOE.

## Si eres developer

Lee [`CONTRIBUTING.md`](https://github.com/ceballosiker/auditor-irpf-es/blob/main/CONTRIBUTING.md) para el flujo OSS completo (branch model, Conventional Commits, pnpm, Vitest, releases).

Áreas con backlog activo:

- `area/engine` — motor de cálculo TypeScript (`src/`).
- `area/docs` — este manual (MkDocs Material).
- `area/ui` — futura calculadora web (Phase 4).
- `area/infra` — CI, releases, GitHub Pages.

Issues etiquetados [`good first issue`](https://github.com/ceballosiker/auditor-irpf-es/labels/good%20first%20issue) son el punto de entrada recomendado.

## Si quieres ayudar con la web

La calculadora interactiva (Phase 4 — v1.0.0) aún no ha empezado. Si quieres aportar diseño o frontend, comenta en el [roadmap pinned issue](https://github.com/ceballosiker/auditor-irpf-es/issues/1) indicando tu perfil.

## Código de conducta

Al participar te adhieres al [Código de conducta](https://github.com/ceballosiker/auditor-irpf-es/blob/main/CODE_OF_CONDUCT.md) (Contributor Covenant v2.1).
