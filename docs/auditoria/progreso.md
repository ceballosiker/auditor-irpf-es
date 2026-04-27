# Progreso de auditoría 2012-2026

Estado vivo de la validación normativa año a año. Cada fila enlaza al issue de
auditoría `audit-YYYY` correspondiente. Los PRs `audit:` que cierren ítems
concretos del checklist deben actualizar esta tabla en el mismo commit.

## Estados

- **no iniciado** — el issue existe pero nadie ha comenzado.
- **en curso** — al menos un ítem del checklist está marcado y verificado contra el BOE.
- **validado** — todos los ítems del checklist están marcados y el issue está cerrado.

## Aplicabilidad de los elementos opcionales

Tres elementos del checklist sólo aplican a partir de un año concreto:

| Elemento             | Aplica desde |
| -------------------- | ------------ |
| MEI                  | 2023         |
| Cuota de Solidaridad | 2025         |
| Deducción SMI        | 2025         |

En la tabla de abajo, los marcadores correspondientes a años anteriores
aparecen como `—` (no aplica). `☐` significa "aplicable, pendiente de validar"
y `✓` "aplicable, validado".

## Tabla de progreso

| Año  | Issue                                                            | MEI | Solidaridad | SMI | Estado      |
| ---- | ---------------------------------------------------------------- | --- | ----------- | --- | ----------- |
| 2012 | [#17](https://github.com/ceballosiker/auditor-irpf-es/issues/17) | —   | —           | —   | no iniciado |
| 2013 | [#18](https://github.com/ceballosiker/auditor-irpf-es/issues/18) | —   | —           | —   | no iniciado |
| 2014 | [#19](https://github.com/ceballosiker/auditor-irpf-es/issues/19) | —   | —           | —   | no iniciado |
| 2015 | [#20](https://github.com/ceballosiker/auditor-irpf-es/issues/20) | —   | —           | —   | no iniciado |
| 2016 | [#21](https://github.com/ceballosiker/auditor-irpf-es/issues/21) | —   | —           | —   | no iniciado |
| 2017 | [#22](https://github.com/ceballosiker/auditor-irpf-es/issues/22) | —   | —           | —   | no iniciado |
| 2018 | [#23](https://github.com/ceballosiker/auditor-irpf-es/issues/23) | —   | —           | —   | no iniciado |
| 2019 | [#24](https://github.com/ceballosiker/auditor-irpf-es/issues/24) | —   | —           | —   | no iniciado |
| 2020 | [#25](https://github.com/ceballosiker/auditor-irpf-es/issues/25) | —   | —           | —   | no iniciado |
| 2021 | [#26](https://github.com/ceballosiker/auditor-irpf-es/issues/26) | —   | —           | —   | no iniciado |
| 2022 | [#27](https://github.com/ceballosiker/auditor-irpf-es/issues/27) | —   | —           | —   | no iniciado |
| 2023 | [#28](https://github.com/ceballosiker/auditor-irpf-es/issues/28) | ☐   | —           | —   | no iniciado |
| 2024 | [#29](https://github.com/ceballosiker/auditor-irpf-es/issues/29) | ☐   | —           | —   | no iniciado |
| 2025 | [#30](https://github.com/ceballosiker/auditor-irpf-es/issues/30) | ☐   | ☐           | ☐   | no iniciado |
| 2026 | [#31](https://github.com/ceballosiker/auditor-irpf-es/issues/31) | ☐   | ☐           | ☐   | no iniciado |

## Cómo participar

1. Elige un año en la tabla con estado **no iniciado**.
2. Abre el issue `audit-YYYY` correspondiente y reclama el slot comentando "tomo este año".
3. Para cada ítem del checklist, valida el valor en `src/normativa.ts` (o `src/pipeline.ts` para el tope 43 %) contra la referencia BOE oficial.
4. Si el valor es correcto, marca el ítem y deja la(s) referencia(s) en la sección "Referencias BOE" del issue.
5. Si encuentras una discrepancia, abre un PR `audit:` con la plantilla `?template=audit.md`: corrige el valor, regenera el fixture afectado y cita la referencia BOE.

Ver [`CONTRIBUTING.md`](../../CONTRIBUTING.md) para el flujo OSS general.
