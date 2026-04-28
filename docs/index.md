# Auditor IRPF ES

> **Implementación pública y auditable del cálculo del IRPF y del salario neto en España, 2012–2026.**

Este manual acompaña al [motor de cálculo](https://github.com/ceballosiker/auditor-irpf-es) y traduce su lógica a lenguaje llano. Su objetivo es **democratizar** el conocimiento de cómo se calcula tu nómina y, en particular, qué efecto ha tenido la **progresividad en frío** entre 2012 y 2026.

## A quién va dirigido

- **Fiscalistas y economistas** que quieran auditar la fidelidad normativa año a año. → empieza por la [tabla de progreso](auditoria/progreso.md).
- **Personas técnicas** que quieran entender el motor o aportar mejoras. → empieza por [Cómo contribuir](contribuir.md).
- **Cualquier contribuyente** que quiera entender qué se descuenta de su nómina y por qué. → próximamente: la calculadora interactiva (Phase 4 — v1.0.0).

## Alcance actual del motor

Modelado:

- _Soltero / sin hijos / sin discapacidad_.
- Tramo autonómico = tramo estatal (es decir, escala estatal duplicada; sin variación por CCAA).

Pendiente (Phase 6):

- Escalas autonómicas por CCAA.
- Deducciones por hijos, ascendientes y discapacidad.
- Deducciones por edad.

## Cómo está organizado este manual

- **[Motor de cálculo](motor/01-cotizacion.md)** — la cadena de cálculo paso a paso, en siete páginas.
- **[Progresividad en frío](progresividad-en-frio.md)** — el concepto clave: por qué los impuestos pueden subir sin que el legislador los suba.
- **Anual** — un resumen por año entre 2012 y 2026 (stubs en v0.4.0; redacción completa en Phase 5).
- **[Auditoría](auditoria/progreso.md)** — estado vivo de la validación normativa.
- **[Cómo contribuir](contribuir.md)** — guía corta por perfil.

## Estado del proyecto

Este sitio se construye sobre la versión `v0.4.0` del motor. Las versiones publicadas anteriores son:

- **v0.1.0** — base OSS + fixtures-oráculo congelados desde el motor original en Python.
- **v0.2.0** — port del motor a TypeScript, validado al céntimo contra los fixtures.
- **v0.3.0** — workflow de auditoría fiscal por años (15 issues `audit-YYYY`).

Ver el [CHANGELOG](https://github.com/ceballosiker/auditor-irpf-es/blob/main/CHANGELOG.md) para el detalle.
