# 💶 Auditor Histórico de Nóminas e IRPF (España 2012–2026) con Ajuste de Inflación

![TypeScript](https://img.shields.io/badge/typescript-5.5%2B-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.18-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Estado](https://img.shields.io/badge/estado-en%20construcci%C3%B3n%20(v0.1)-orange.svg)

Auditor fiscal que calcula el salario neto en España (2012–2026) euro a euro: IRPF, Seguridad Social, MEI y Cuota de Solidaridad, con análisis de pérdida de poder adquisitivo ajustada a la inflación real (IPC oficial del INE). Se expondrá como una **calculadora interactiva 100 % en el navegador** (sin servidor) acompañada de un manual divulgativo y un proceso de auditoría pública año a año.

> **Estado actual (v0.1):** se está portando el motor de cálculo desde el script original en Python (`Calculo_Salario_IRPF.py`) a una librería en TypeScript. Los **fixtures JSON** capturados del motor Python (`tests/fixtures/golden_*.json`) son la **fuente de verdad** mientras dura el porting; el motor TS deberá coincidir con ellos al céntimo.

---

## 🎯 Misión del proyecto

> **Democratizar el conocimiento del cálculo del IRPF y del salario neto, y las implicaciones de la progresividad en frío entre 2012 y 2026.**

Este repositorio es una implementación pública y auditable del cálculo de nómina española. El objetivo a medio plazo es triple:

1. **Un motor de cálculo revisado por pares** — TypeScript, validado contra fixtures generados desde el motor Python original, auditado por fiscalistas.
2. **Un manual divulgativo** que explique en lenguaje llano cada cambio normativo y su impacto real sobre el bolsillo.
3. **Una web pública e interactiva** ejecutándose enteramente en el navegador (sin backend), servida desde GitHub Pages.

## 🤝 Llamada a colaboradores

Busco tres perfiles. Si te identificas con alguno, abre una *issue* o un PR indicándolo:

- **🧾 Fiscalistas y economistas** — audita los resultados año a año al mínimo detalle. ¿Falta un matiz normativo? ¿Un redondeo oficial distinto? ¿Una interacción entre Art. 19 y Art. 20 mal secuenciada? Dímelo. La precisión legal es la prioridad número uno.
- **💻 Techies (TypeScript / web)** — porting del motor a TS, suite de tests con Vitest, ESLint/Prettier, CI con GitHub Actions, y la futura SPA (HTML + Chart.js + SheetJS). React queda explícitamente fuera; el stack es deliberadamente *vanilla*.
- **🌐 Diseño / UX** — cuando la web aterrice (v1.0) buscaremos accesibilidad sólida (axe-core, Lighthouse a11y ≥ 95), UI clara y móvil-first, sin telemetría ni cookies.

También es muy bienvenida la contribución de **redactores divulgativos** que extraigan, a partir del código, un manual sencillo que explique:
- Qué calcula cada paso de la nómina.
- Qué cambió en cada año normativo (2015, 2018, 2023, 2025, 2026…) y por qué.
- Qué es la progresividad en frío y cómo se manifiesta en los resultados.

## 🧭 Alcance actual (supuesto simplificado)

Para maximizar la precisión antes de ampliar casuística, el motor modela deliberadamente un único perfil:

- **Situación personal:** soltero/a, sin hijos, sin discapacidad.
- **Tramo autonómico = tramo estatal** (se duplica la escala estatal; no se modelan particularidades por CCAA).

### 🎚️ Precisión normativa ya incorporada

* **📜 Histórico 2012–2026:** bases máximas de cotización, tipos SS, reducciones, gastos fijos y escalas de IRPF.
* **Régimen transitorio de 2018** para la Reducción por Rendimientos del Trabajo (Disp. Ad. 47ª LIRPF), como promedio de la normativa pre y post-reforma.
* **Reducción Art. 20** calculada sobre el rendimiento neto previo, separada correctamente de los gastos deducibles generales (Art. 19).
* **Mínimo personal** aplicado como cuota (tipo del primer tramo), no como reducción de la base.
* **Tope legal de retención del 43 %** sobre `(bruto − mínimo exento)` (Art. 85.3 RIRPF).
* **MEI** (desde 2023) y **Cuota de Solidaridad** progresiva (desde 2025, actualizada a tipos de 2026), con reparto 5/6 empresa · 1/6 trabajador.
* **Deducción SMI** actualizada para 2025 y 2026.
* **Inflación real** encadenada con el IPC oficial del INE (diciembre a diciembre).

## 🗺️ Hoja de ruta

### Hoja de ruta de desarrollo

| Versión | Hito |
|---|---|
| **v0.1.0** *(en curso)* | Infraestructura OSS, tooling TypeScript, fixtures JSON desde el motor Python (oráculo). |
| **v0.2.0** | Port del motor a TypeScript validado al céntimo contra los fixtures de v0.1.0. |
| **v0.3.0** | Workflow de auditoría fiscal: 15 issues (uno por año, 2012–2026) con checklist normativo + referencias BOE. |
| **v0.4.0** | Manual divulgativo en MkDocs publicado en GitHub Pages. |
| **v1.0.0** | Calculadora web interactiva: SPA estático, 100 % en el navegador, GitHub Pages. |

Sigue el progreso en los [issues abiertos](https://github.com/ceballosiker/auditor-irpf-es/issues) y [milestones](https://github.com/ceballosiker/auditor-irpf-es/milestones).

### Hoja de ruta normativa (post-v1.0)

- Tramos autonómicos específicos por Comunidad Autónoma.
- Deducciones familiares (hijos, ascendientes, discapacidad).
- Deducciones por edad.

## 🚀 Instalación y uso

### TypeScript (motor en porting)

```bash
git clone https://github.com/ceballosiker/auditor-irpf-es.git
cd auditor-irpf-es
npm install
npm test            # Vitest
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

Requisitos: Node ≥ 18.18.

### Python (motor original — referencia de v0.1)

El script `Calculo_Salario_IRPF.py` permanece como **referencia de comportamiento** durante el porting. Sigue siendo ejecutable y genera el Excel completo:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python3 Calculo_Salario_IRPF.py
```

Para regenerar los fixtures JSON desde el motor Python (operación idempotente):

```bash
.venv/bin/python3 scripts/generate_fixtures.py
```

> ⏳ La generación del Excel tarda varios minutos por el volumen de cálculos (>1,5 millones de operaciones). Los fixtures, en cambio, son cuestión de segundos.

## 📊 Entendiendo el output (Excel generado por el motor Python)

El script Python produce `Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx` con las siguientes pestañas. El motor TypeScript replicará esta estructura vía [SheetJS](https://sheetjs.com/) cuando aterrice el porting (Phase 1).

| Pestaña | Qué contiene |
|---|---|
| `CONTROL_GENERAL` | Diccionario normativo anual: tipos SS, MEI, mínimos, gastos fijos, umbrales del Art. 20. |
| `CONTROL_TRAMOS_IRPF` | Histórico de tramos y tipos de IRPF de cada año. |
| `COMPARATIVA_INFLACION` | Análisis macroeconómico: cuánto poder adquisitivo ha perdido un salario frente a su equivalente pasado, deflactando el bruto y actualizando todos los impuestos. |
| `DAT_2012` … `DAT_2026` | Pestañas anuales con desglose euro a euro (0 €–100.000 €): coste laboral, cotizaciones patronales/obreras, cuota por cada tramo de IRPF, aplicación de límites legales y salario neto final. |

## 🏗️ Arquitectura

```
.
├── src/                       # Motor TypeScript (en porting; aterriza en v0.2.0)
│   └── index.ts               # Public API barrel
├── test/                      # Vitest tests
├── tests/fixtures/            # Golden JSON fixtures: oráculo inmutable
│   └── golden_YYYY.json       # 10 brutos representativos por año (2012–2026)
├── scripts/
│   └── generate_fixtures.py   # Genera los fixtures desde el motor Python
├── Calculo_Salario_IRPF.py    # Motor Python original (referencia de v0.1; archivado al cierre de v0.2.0)
├── requirements.txt           # Deps del motor Python
└── package.json               # npm + Vitest + ESLint + Prettier
```

Punto único de verdad normativa hoy: `obtener_parametros(anio)` en `Calculo_Salario_IRPF.py`. Tras la v0.2.0, será `obtenerParametros(anio)` en `src/normativa.ts`.

## 🤝 Contribuciones

Si detectas una actualización normativa, un error en los parámetros oficiales o quieres añadir funcionalidad:

1. Abre o reclama una *issue* (etiquetas `area/…` + `type/…` y un milestone).
2. Crea una rama desde `develop`: `git switch -c feat/NN-mi-feature` (donde `NN` es el número de issue).
3. Sigue [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat:`, `fix:`, `docs:`, `test:`, `ci:`, `refactor:`, `build:`, `chore:`).
4. Asegúrate de que `npm run lint && npm run typecheck && npm test` queden verdes.
5. Abre un *Pull Request* contra `develop` indicando el perfil del aporte (fiscal / código / web / divulgación).

Para auditorías normativas, **incluye siempre la referencia legal** (BOE, artículo, disposición).

## ⚖️ Aviso legal

Este proyecto tiene fines educativos, divulgativos y de análisis económico. Aunque el algoritmo sigue minuciosamente la normativa de la AEAT y la Seguridad Social española, los resultados son orientativos y no sustituyen el consejo de un profesional fiscal o un graduado social.

## 📝 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE`.
