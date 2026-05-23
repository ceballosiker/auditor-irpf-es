# Changelog

Todos los cambios notables de este proyecto se documentarán aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [1.4.0] - 2026-05-23

Versión de seguimiento sobre v1.3.0: la SPA y los 3 SVGs estáticos del manual ganan modo oscuro editorial cálido, activado automáticamente por `prefers-color-scheme: dark` sin JavaScript en producción. Sin cambios en el motor de cálculo ni en los fixtures-oráculo.

### Added

- **Modo oscuro editorial automático** — paleta "Tinta sobre papel quemado" (paper `#1a1612`, ink `#f3ede2`, accent `#e89052`, neto `#6ab07a`, ss `#8a8e9e`) activada por `@media (prefers-color-scheme: dark)` en `src/ui/theme.css`. Dos tokens nuevos (`--surface`, `--cta-ink`) reemplazan los literales `#fff` que sobrevivían en inputs, CTA, `.v-bar`, `.multi-cell` y range thumbs. Selector dual `:root[data-theme='dark']` expuesto solo como hook de tests; en producción no hay toggle ni JS. Cierra #70.
- **SVGs del manual theme-aware** — los 3 charts estáticos (`docs/assets/*.svg`) embeben su propia hoja `<style>` con tokens `--c-bg/--c-axis/--c-grid/--c-text/--c-title/--c-s0..s5` y bloque `@media` para dark; los charts SPA ya usaban `var()` y heredan sin cambios. Las paletas light/dark de series se exportan desde `scripts/render-charts.ts` (`PALETTE_LIGHT`, `PALETTE_DARK`) y se verifican vía test de contraste.
- **`test/contrast.test.ts`** — suite Node que parsea `theme.css` e importa las paletas del manual, comprueba ratios WCAG 2.1 ≥ 4.5:1 en todos los pares texto/fondo críticos en ambos esquemas (36 verificaciones).

### Changed

- **`test/a11y.browser.test.ts` parametrizado por tema** — refactor a una factoría `suiteFor(theme)` que aplica `data-theme` y ejecuta axe-core en light + dark (6 tests).
- **`test/charts.browser.test.ts` añade 4 verificaciones** de que los fills `var(--accent)`/`var(--neto)`/`var(--ss)` resuelven a colores distintos y no transparentes en ambos esquemas — guard contra regresión silenciosa donde un token mal definido devolvería `rgba(0,0,0,0)`.
- **`.excel-band h3` ahora hereda color del padre** (`color: inherit` en vez de `var(--paper)`) para que el override `:root[data-theme='dark'] .excel-band` lo arrastre y no caiga a 1.07:1 sobre `--paper-deep`.
- **`scripts/render-charts.ts`** elimina el campo `color` de la interface `Series` (la asignación de color pasa a derivarse del índice de la serie vía `var(--c-s${i})`) e introduce `inflacionFor(anio)` como guard contra `INFLACION_A_2026[a]` ahora que `noUncheckedIndexedAccess` alcanza el archivo.

## [1.3.0] - 2026-05-08

Versión de seguimiento sobre v1.2.1: el campo «Año fiscal» del formulario pasa de un `<select>` a un scrubber horizontal con teclado, y el helper `requireEl` enriquece sus mensajes de error. Sin cambios en el motor de cálculo ni en los fixtures-oráculo.

### Changed

- **Scrubber de año fiscal en lugar del `<select>`** — el campo «Año fiscal» pasa a un `<input type="range">` con styling propio (pista, manija y `<output>` sincronizado vía `aria-live="polite"`). Hereda toda la accesibilidad del range nativo: teclado (`ArrowLeft`/`ArrowRight` para mover ±1, `Home`/`End` para saltar a los extremos), click en cualquier punto de la pista, y `aria-valuetext` actualizado en cada cambio. Mantiene el deep-link `?anio=YYYY` ya wired desde v1.2.0. El lead del hero pierde su `max-width` para acompañar la longitud completa del scrubber. Cierra #68.
- **Mensaje de error de `requireEl` enriquecido** — incluye ahora el identificador del root (id si lo tiene; etiqueta + clases en otro caso) además del selector que falla, para localizar más rápido el origen cuando la composición de secciones crece. Cierra #76.
- **`form-row--2col` eliminado** — el modificador era redundante una vez que `.form-row` ya define dos columnas en su breakpoint estándar. Sin cambio visual.

## [1.2.1] - 2026-05-07

Release de mantenimiento sobre v1.2.0: dos pulidos visuales del rediseño editorial-dataviz que arrastraban desde v1.1.0. Sin cambios en el motor de cálculo ni en los fixtures-oráculo.

### Fixed

- **Drill-tables con anchos fijos en `breakdown` y `brackets`** — las tablas dentro de los `<details>` colapsables auto-dimensionaban por contenido y rompían la rejilla visual entre filas. Pasan a `table-layout: fixed` con columnas 65/35 y `font-variant-numeric: tabular-nums` vía la nueva clase `.drill-table` en `src/ui/theme.css`. Cierra parte de #77.
- **Ejes en los pequeños múltiples** — `renderMultiples` añade etiquetas mínimas en cada mini-gráfico: min/max del valor en Y (formateadas con el helper de cada serie) y primer/último año en X. Los paddings se separan en `PAD_L/R/T/B` para dejar sitio al label de Y sin alterar el aspecto del sparkline. Cierra parte de #77.

## [1.2.0] - 2026-05-04

Versión de seguimiento sobre v1.1.0: refresco de tooling, dos pulidos pequeños en la SPA, una ampliación aditiva del tipo público `Nomina` que elimina el último épsilon de coma flotante de la UI, y un deep-link bidireccional entre la calculadora y los stubs anuales del manual.

### Added

- **`Nomina` gana cuatro campos derivados** — `topeAlcanzado`, `meiTrabajador`, `solidaridadTrabajador`, `tope43Aplica`. La UI los lee directamente en `breakdown.ts` y `brackets.ts` en lugar de reconstruirlos por aritmética sobre otros campos. Cambio aditivo en el tipo público; las fixtures-oráculo (que comparan vía `nominaToFila`, sin tocar) no se regeneran. Cierra #65.
- **Deep-link `?anio=YYYY` en la calculadora** — `?anio=2018` preselecciona el año al cargar (validado contra `ANIOS_SOPORTADOS`, fallback a `ANIO_MAX`). El cambio de año en el formulario actualiza la URL vía `history.replaceState`, así que recargar conserva el año. Cada `docs/anual/YYYY.md` (15 stubs) lleva ahora un enlace «▷ Ver este año en la calculadora →» en cabecera, generado por `scripts/render-anual-stubs.ts`. Cierra #71.
- **Helper `requireEl()`** en `src/ui/dom.ts` — sustituye el patrón `querySelector + null-check` repetido en `app.ts` y `form.ts`. Sin cambio de comportamiento. Parte de #64.

### Changed

- **`engines.node` sube de `>=18.18` a `>=20.18`** — necesario para `@lhci/cli` 0.15 (Lighthouse 12, que importa locales JSON con `import attributes`) y para que `npm install` funcione sin `--legacy-peer-deps`. Matriz de CI: Node 18 fuera, Node 22 dentro, Node 20 se mantiene. **Cambio incompatible para contribuidores en Node 18; sin impacto en runtime ni en el bundle distribuido.** `.nvmrc` y los badges del README también se actualizan a 20.18. Cierra #61.
- **Refresco de dev-deps** — `vitest` / `@vitest/browser` / `@vitest/coverage-v8` (1.6 → 2.1.9), `eslint` (9.7 → 9.39), `typescript-eslint` (8.0 → 8.59), `typescript` (5.5 → 5.9), `vite` (5.3 → 5.4), `prettier` (3.3 → 3.8), `@types/node` (^20 → ^22). `playwright` y `tsx` ya estaban en current. Sin cambios funcionales en el SPA.
- **`src/ui/format.ts` renombrado a `src/ui/intl.ts`** — desambigua frente a `src/format.ts`, que es el serializador numérico Python-compatible para Excel. Mismo nombre, distinta capa, fuente recurrente de confusión. Sin cambio de API: `eur()` y `percent()` siguen siendo los exports. Parte de #64.
- **El épsilon `1e-6` desaparece de la UI** — `brackets.ts` ya no compara `cuotaTrasSMI > limite43 + 1e-6`; lee `n.tope43Aplica` directamente. La comparación del motor ya era autoritativa; la UI sólo amplificaba ruido de coma flotante.

### Notes

- El sub-item original de #64 sobre hoistar selectores DOM a un mapa de constantes se descarta: post-#72, el set total cabe en `app.ts` y un mapa compartido sería sobre-ingeniería.

## [1.1.0] - 2026-05-04

Rediseño completo de la calculadora web bajo una dirección editorial-dataviz: paleta cálida (off-white + naranja quemado + verde profundo), tipografía Georgia, narrativa pública-primero (tu neto → ¿adónde va el resto? → ¿cómo se calcula? → ¿qué ha cambiado entre 2012 y 2026?), con todo el detalle de auditoría (MEI, Solidaridad, T1–T7, tope 43 %, deducción SMI) detrás de un `<details>` colapsable por sección. Pico CSS y Chart.js desaparecen del bundle; en su lugar, una hoja de tokens propia (`src/ui/theme.css`) y cuatro renderers SVG hechos a mano. El motor de cálculo y los 15 fixtures-oráculo no se tocan.

### Added

- **Cuatro nuevas visualizaciones SVG hechas a mano** en `src/ui/charts/` — `stacked-bar` (barra apilada NETO/IRPF/SS con porcentaje destacado), `vasos` (un "vaso" por tramo de IRPF que se llena por orden, atacando el mito de "si cruzo a 30 %, todo se grava al 30 %"), `gap-area` (brecha acumulada de poder adquisitivo 2012–2026 frente a una fiscalidad indexada, con headline numérico y copy adaptado al signo) y `multiples` (cuatro mini-gráficos: neto real, IRPF real, tipo efectivo, SS real). Cada SVG lleva `role="img"` + `<title>` + `<desc>` y, donde la información es densa, una `<table class="sr-only">` paralela para lectores de pantalla.
- **Seis secciones de página** en `src/ui/sections/` — `nav` (tira superior con enlaces al manual y GitHub), `hero` (eyebrow + h1 + lead + formulario + neto destacado con `aria-live="polite"`), `breakdown` (¿adónde va el resto?), `brackets` (¿cómo se calcula el IRPF?), `history` (¿qué ha cambiado entre 2012 y 2026?) y `excel` (banda final oscura con CTA de descarga). Las cuatro de contenido tienen un `<details id="drill-…">` que despliega la tabla completa de auditoría — los números densos siguen a un click de distancia.
- **`src/ui/history-data.ts`** — helper de cálculo del contrafactual de progresividad en frío. `parametrosIndexados(anio)` devuelve los parámetros del año-N con cada campo en € escalado por la inflación acumulada desde 2012; los campos closure (`reduccionTrabajo`, `deduccionSMI`) se envuelven con la identidad de homogeneidad de grado 1, `f_indexada(x) = α · f(x/α)`, lo que permite calcular el contrafactual sin tocar el motor. `gapSeries(bruto2026)` devuelve las series año a año necesarias para el gráfico de brecha. 10 tests cubren identidad en 2012, escalado en años representativos, preservación de tipos/estructura y el envoltorio de las funciones piecewise-linear (incluyendo el `deduccionSMI` no-trivial de 2025/2026).
- **Integración visible con el manual** — la nav superior incluye un enlace a "Manual divulgativo" (`/manual/`); cada sección de contenido lleva una línea italica en el color acento (clase `.read-more`) con un enlace específico: cotización SS → `motor/01-cotizacion`, tramos → `motor/06-tramos-irpf`, brecha → `progresividad-en-frio`. Todos los enlaces son relativos para funcionar bajo el subpath `/auditor-irpf-es/` de GitHub Pages.
- **Sign-adaptive headline copy en la sección de historia** — el titular cambia según el signo de la brecha de hoy: `> +100 €` ⇒ "tendrías X € más en el bolsillo", `< −100 €` ⇒ "tendrías X € menos: las reformas posteriores a 2012 te benefician en este caso", entre ambos ⇒ "tu neto real es prácticamente equivalente al de una fiscalidad indexada a 2012". Honra la posibilidad de que en algunos brutos las reformas de tarifa hayan compensado o superado la inflación.
- **Cuatro issues de seguimiento** abiertos para tracking de mejoras opcionales que quedan fuera de v1.1.0 — **#68** (scrubber/slider del año fiscal), **#69** (webfont serif curado tipo Source Serif Variable), **#70** (paleta dark-mode), **#71** (deep-link `?anio=YYYY` + cross-links bidireccionales desde `anual/YYYY.md`).

### Changed

- **Pico CSS reemplazado por una hoja de tokens propia** (`src/ui/theme.css`, ~210 líneas) — paleta editorial (`--paper`, `--paper-deep`, `--ink`, `--ink-soft`, `--ink-mute`, `--rule`, `--accent`, `--accent-soft`, `--neto`, `--ss`), familias `--font-display` (Georgia + fallbacks) y `--font-body` (sistema), espaciado fluido `--space-section`. Sin webfonts, sin runtime CSS-in-JS, sin reset agresivo. Las clases utilitarias necesarias (`.eyebrow`, `.lead`, `.cta`, `.nav`, `.hero-num`, `.excel-band`, `.vasos`, `.multiples`, `.read-more`, `.form-row`) viven en el mismo archivo. Cada par token/fondo lleva inline un comentario con la ratio de contraste WCAG 2.1 medida (todas pasan AA — la más ajustada es `--accent` sobre `--paper-deep` a 4.69:1, justo por encima del umbral de 4.5:1).
- **Chart.js eliminado del bundle** — los cuatro gráficos del rediseño se renderizan con SVG construido vía template-literals (no `<canvas>`, no virtual DOM, no instancia que destruir entre renders). El SPA completo sigue siendo zero-runtime-dependency salvo el `xlsx` (SheetJS) cargado dinámicamente al hacer click en el botón de descarga.
- **`<meta name="color-scheme">` en `index.html` cambiado de `light dark` a `light only`** — el dark-mode editorial es trabajo de diseño aparte (issue #70), no un swap de tokens. El SPA no fuerza colores en dark, así que tampoco prometemos esa rama.
- **Punto de montaje del SPA**: `index.html` cambia de `<main id="app" class="container">` a `<div id="app">`. `app.ts` escribe su propio `<main class="container">` dentro como landmark único de la página, evitando dos `<main>` anidados (HTML5 sólo admite uno).
- **API de las secciones**: `mountX(target)` para el render inicial, `updateX(target, state)` para el re-render reactivo en cada cambio del formulario. `app.ts` orquesta el fan-out a las cuatro secciones state-aware (hero, breakdown, brackets, history) sin estado compartido fuera de `{ bruto, anio }`.
- **Manual divulgativo: dos líneas refrescadas** — `docs/index.md:11` y `docs/contribuir.md:28` describían la calculadora interactiva como "próximamente" / "aún no ha empezado" a pesar de haber sido publicada en `v1.0.0` el 3 de mayo. Ahora `docs/index.md` enlaza directamente al sitio en producción y `docs/contribuir.md` la describe como "publicada".

### Removed

- `@picocss/pico` y `chart.js` desaparecen de `package.json`. La dependencia restante en runtime es `xlsx` (SheetJS, ya en chunk dinámico).
- `src/ui/results.ts`, `src/ui/chart.ts`, `src/ui/excel-button.ts` — reemplazados por los módulos de `src/ui/sections/` y `src/ui/charts/`.

### Notes

- El milestone originalmente marcado como `v1.1.0` en el README de `v1.0.0` (redacción completa de los 15 resúmenes anuales en paralelo con la auditoría fiscal) se desplaza a un release posterior. Esta `v1.1.0` empuja el rediseño visual del front-end, que ofrece mayor impacto inmediato para el público general que es la audiencia primaria del proyecto.

## [1.0.0] - 2026-05-03

Calculadora IRPF interactiva en GitHub Pages. Cualquier persona puede introducir un bruto y un año entre 2012 y 2026 y ver, sin servidor y sin red, el desglose completo (cotización social, MEI, Solidaridad, IRPF tramo a tramo, mínimo personal aplicado como cuota, tope 43 %, deducción SMI) más la curva de pérdida de poder adquisitivo deflactada a euros de 2026. Bundle estático ~92 KB gzip iniciales; Chart.js (~71 KB gzip) y SheetJS (~96 KB gzip) en chunks dinámicos. La auditoría axe-core (WCAG 2.1 AA) y los thresholds Lighthouse (perf ≥ 0.85, a11y ≥ 0.95, bp ≥ 0.95, seo ≥ 0.90) corren en cada PR.

### Added

- **Pages unificado: SPA en raíz + manual en `/manual/`** (Phase 4.6) — `.github/workflows/pages.yml` (renombrado desde `docs.yml`) construye en un solo job el SPA (Vite, `npm run build` → `dist/`) y el manual (MkDocs, `mkdocs build --strict` → `site/`), compone un único artefacto Pages con `dist/` en raíz y `site/` bajo `public/manual/`, y despliega en push a `main`. La página-redirección stub anterior desaparece — la raíz ahora sirve la calculadora directamente. `vite.config.ts` configurado con `base: './'` para que las URLs de los assets del SPA funcionen tanto en `/` (preview local) como en `/auditor-irpf-es/` (Pages).
- **Auditoría axe-core en CI** (Phase 4.5) — `test/a11y.browser.test.ts` ejecuta `axe-core` contra el SPA en tres estados (carga inicial, tras cambiar bruto, con `aria-busy="true"` aplicado al botón Excel) bajo Vitest browser project (Playwright + Chromium). Falla CI si aparece cualquier violación `serious` o `critical` de WCAG 2.1 AA (`wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`best-practice`). Tema fijado a `data-theme="light"` para que las reglas de contraste sean deterministas. Job `browser-tests` añadido a `.github/workflows/ci.yml` con cache de la binary Playwright.
- **Lighthouse CI** (Phase 4.5) — `.github/workflows/lighthouse.yml` ejecuta Lighthouse mobile (mediana de 3) en cada PR a `develop`/`main`. Thresholds: performance ≥ 0.85 (CI tolera ruido de runners; objetivo local ≥ 0.90), accesibilidad ≥ 0.95, best-practices ≥ 0.95, SEO ≥ 0.90. Reportes subidos a almacenamiento temporal público; HTML también guardado como artefacto. Comando local: `npm run lighthouse`. Scores actuales sobre el bundle: perf 0.99, a11y 0.98, bp 0.96, seo 1.0.
- **Tabla `sr-only` espejo del chart** — usuarios de lectores de pantalla acceden a las mismas series (bruto, neto e IRPF reales en € de 2026) que el `<canvas>`. La tabla se sincroniza con el chart en cada cambio de bruto. Helper CSS `.sr-only` (patrón estándar WCAG visually-hidden) en `src/ui/sr-only.css`.
- **Meta tags OpenGraph y Twitter Card** en `index.html` para que enlaces compartidos en redes muestren preview correcta y SEO ≥ 0.90 en Lighthouse.
- **Descarga de Excel completo desde el navegador** (Phase 4.4) — botón "Descargar Excel completo (2012–2026)" que genera el libro `.xlsx` con las cuatro pestañas (`CONTROL_GENERAL`, `CONTROL_TRAMOS_IRPF`, `COMPARATIVA_INFLACION`, `DAT_2012`…`DAT_2026`) en el cliente, sin red. Usa `import('../excel.js')` dinámico para que SheetJS (~95 KB gzip) viva en un chunk separado y solo se descargue al hacer click. Estado `aria-busy` durante la generación; `<p role="alert">` si SheetJS falla.
- `src/excel.ts` ahora expone tres funciones complementarias: `generarWorkbook(opts)` (puro, devuelve `WorkBook`), `generarExcel(path, opts)` (escritura Node, sin cambios para el CLI) y `generarExcelBlob(opts)` (browser-safe, devuelve `Blob`). El comportamiento del CLI no cambia y los 4 smoke tests siguen verdes.
- **Comparativa frente a inflación** (Phase 4.3) — gráfico Chart.js que ilustra la pérdida de poder adquisitivo: para el bruto introducido (interpretado como € de 2026), deflacta al equivalente nominal de cada año entre 2012 y 2026, calcula `salarioNeto` e `irpfFinal` con la fiscalidad de ese año y reinflacta los tres números a € de 2026. Tres series en línea: bruto real (constante, dashed), neto real (creciente luego decreciente vía progresividad en frío), IRPF real (creciente). Tooltips en español con `Intl.NumberFormat`. Re-render del chart en cada cambio de bruto destruyendo la instancia previa para evitar fugas.
- **Calculadora interactiva** (Phase 4.2) — el SPA pasa de placeholder a calculadora funcional:
  - `src/ui/form.ts` — formulario con bruto (€, `step=100`), año (2012–2026, default 2026 ordenado descendente) y CCAA (deshabilitado, "Estatal" fijo). Etiquetas semánticas `<label>` con texto de ayuda en `<small>` para cada campo.
  - `src/ui/results.ts` — panel de resultados en tres `<article>`s (cotización social, IRPF, neto). Detalla tope de cotización, MEI/Solidaridad trabajador (cuando aplican), reducción Art. 20, gastos Art. 19, base imponible, mínimo personal aplicado como cuota, tope 43 % con etiqueta "aplica/no aplica", y neto anual + mensual (×14). Tabla de tramos IRPF muestra solo los tramos con cuota > 0 (o un mensaje si no hay IRPF a pagar).
  - `src/ui/format.ts` — helpers `eur()` y `percent()` con `Intl.NumberFormat('es-ES', …)` para que todos los importes y porcentajes usen el formato español de forma consistente.
  - `src/ui/main.ts` — wiring reactivo: cada `input`/`change` del formulario re-renderiza la sección de resultados (sin debouncing). Sección con `aria-live="polite"` para que lectores de pantalla anuncien las actualizaciones.
- **Esqueleto SPA estático** (Phase 4.1) — primer paso hacia la calculadora interactiva (`v1.0.0`):
  - `index.html` en la raíz como entrypoint Vite (lang `es`, viewport, meta description, mount point `<main id="app">`).
  - `src/ui/main.ts` — bootstrap mínimo que importa Pico.css y renderiza un placeholder en `#app`.
  - `src/ui/render.ts` — helper `render(target, html)` para usar template strings sin reaching directo a `innerHTML` desde toda la app.
  - `@picocss/pico` añadido como dependencia (CSS clásico, sin runtime, ~12 KB gzip), bundleado por Vite — sin CDN externo.
- `.github/workflows/ci.yml` — añadido paso `npm run build` para que CI cace cualquier rotura del bundle Vite a partir de ahora.

### Changed

- **Chart.js cargado bajo demanda** (Phase 4.5, perf) — el bundle inicial ya no incluye Chart.js (~70 KB gzip). Se carga vía `import('./chart.js')` programado con `requestIdleCallback` después del primer render del formulario y resultados, así el LCP no compite con el código del gráfico. Bundle deltas: chunk de entrada 222 KB → 14.7 KB (gzip 77 KB → 6.1 KB).
- **Bootstrap del SPA extraído a `src/ui/app.ts`** (Phase 4.5) — `main.ts` queda como entry-point shim de 9 líneas que importa el CSS y llama a `mountApp(target)`. Permite que los tests browser monten la app contra un DOM fresco sin tropezar con la cache de módulos ESM. Sin cambio de comportamiento en producción.
- **Fixtures unificadas en `test/fixtures/`** (Phase 4.5, chore) — antes vivían en un directorio hermano `tests/fixtures/`. Consolidación bajo un único root de tests para reducir fricción de onboarding. Sin cambio de contenido (regeneración con `python3 legacy/python-reference/generate_fixtures.py` produce diff vacío).
- **`generate_fixtures.py` reubicado a `legacy/python-reference/`** (Phase 4.5, chore) — junto al motor Python original que importa. `scripts/` queda como directorio TypeScript-only. La instrucción de regeneración en `CONTRIBUTING.md` y `README.md` se actualiza al nuevo path.
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

[Unreleased]: https://github.com/ceballosiker/auditor-irpf-es/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v1.2.0
[1.1.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v1.1.0
[1.0.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v1.0.0
[0.4.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.4.0
[0.3.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.3.0
[0.2.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.2.0
[0.1.0]: https://github.com/ceballosiker/auditor-irpf-es/releases/tag/v0.1.0
