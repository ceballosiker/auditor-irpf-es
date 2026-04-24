# 💶 Auditor Histórico de Nóminas e IRPF (España 2012–2026) con Ajuste de Inflación

![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Estado](https://img.shields.io/badge/estado-en%20auditoría%20comunitaria-orange.svg)

Auditor fiscal en Python que calcula el salario neto en España (2012–2026) euro a euro. Genera una auditoría masiva en Excel del IRPF, Seguridad Social, MEI y Cuota de Solidaridad, y analiza la pérdida de poder adquisitivo ajustada a la inflación real (IPC oficial del INE).

A diferencia de las calculadoras de sueldo neto convencionales, este script **genera un informe exhaustivo de más de 1,5 millones de cálculos**, recorriendo todos los tramos salariales (de 0 € a 100.000 €) y aplicando un **análisis macroeconómico de inflación** para revelar la pérdida real de poder adquisitivo provocada por la *progresividad en frío* (el conocido como **hachazo fiscal silencioso**).

---

## 🎯 Misión del proyecto

> **Democratizar el conocimiento del cálculo del IRPF y del salario neto, y las implicaciones de la progresividad en frío entre 2012 y 2026.**

Este repositorio es una implementación pública y auditable del cálculo de nómina española. El objetivo a medio plazo es triple:

1. **Un motor de cálculo revisado por pares** — Python, auditado por fiscalistas.
2. **Un manual divulgativo** derivado del propio código, que explique en lenguaje llano cada cambio normativo y su impacto real sobre el bolsillo.
3. **Una web pública e interactiva** construida sobre el mismo motor.

## 🤝 Llamada a colaboradores

Busco tres perfiles. Si te identificas con alguno, abre una *issue* o un PR indicándolo:

- **🧾 Fiscalistas y economistas** — audita los resultados año a año al mínimo detalle. ¿Falta un matiz normativo? ¿Un redondeo oficial distinto? ¿Una interacción entre Art. 19 y Art. 20 mal secuenciada? Dímelo. La precisión legal es la prioridad número uno.
- **💻 Techies** — propón mejoras de código, optimizaciones (el script tarda minutos), tests automatizados, formatos de salida alternativos (CSV, Parquet, JSON), CI, modularización.
- **🌐 Web builders** — coordinación y desarrollo de la web pública para que cualquier persona pueda consultar su caso sin abrir un Excel de millones de filas.

También es muy bienvenida la contribución de **redactores divulgativos** que extraigan, a partir del código, un manual sencillo que explique:
- Qué calcula cada paso de la nómina.
- Qué cambió en cada año normativo (2015, 2018, 2023, 2025, 2026…) y por qué.
- Qué es la progresividad en frío y cómo se manifiesta en los resultados.

## 🧭 Alcance actual (supuesto simplificado)

Para poder maximizar la precisión antes de ampliar casuística, el motor modela deliberadamente un único perfil:

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

## 🗺️ Hoja de ruta (aún no implementado)

- Tramos autonómicos específicos por Comunidad Autónoma.
- Deducciones familiares (hijos, ascendientes, discapacidad).
- Deducciones por edad.

## 🚀 Instalación y uso

```bash
git clone https://github.com/ceballosiker/auditor-irpf-es.git
cd auditor-irpf-es
pip install -r requirements.txt
python Calculo_Salario_IRPF.py
```

Dependencias: `pandas`, `numpy`, `openpyxl` (Python 3.8+).

> ⏳ La generación del archivo Excel tarda varios minutos por el volumen de cálculos. Se mostrará el progreso en consola.

## 📊 Entendiendo el output (Excel generado)

El script produce `Auditoria_Integral_Nominas_e_Inflacion_2012_2026.xlsx` con las siguientes pestañas:

| Pestaña | Qué contiene |
|---|---|
| `CONTROL_GENERAL` | Diccionario normativo anual: tipos SS, MEI, mínimos, gastos fijos, umbrales del Art. 20. |
| `CONTROL_TRAMOS_IRPF` | Histórico de tramos y tipos de IRPF de cada año. |
| `COMPARATIVA_INFLACION` | Análisis macroeconómico: cuánto poder adquisitivo ha perdido un salario frente a su equivalente pasado, deflactando el bruto y actualizando todos los impuestos. |
| `DAT_2012` … `DAT_2026` | Pestañas anuales con desglose euro a euro (0 €–100.000 €): coste laboral, cotizaciones patronales/obreras, cuota por cada tramo de IRPF, aplicación de límites legales y salario neto final. |

## 🏗️ Arquitectura rápida

Todo vive en `Calculo_Salario_IRPF.py`, en 6 secciones numeradas. Si vas a contribuir código, ver también `CLAUDE.md` para la descripción técnica detallada (orden del pipeline fiscal, dos motores de cálculo que deben mantenerse sincronizados, etc.).

Punto único de verdad normativa: `obtener_parametros(anio)`. Cualquier actualización de ley se centraliza ahí.

## 🤝 Contribuciones

Si detectas una actualización normativa, un error en los parámetros oficiales o quieres añadir funcionalidad:

1. *Fork* del repositorio.
2. Crea una rama (`git checkout -b feature/NuevaNormativa`).
3. *Commit* de los cambios (`git commit -m 'Añade tipos IRPF 2027'`).
4. *Push* a la rama (`git push origin feature/NuevaNormativa`).
5. Abre un *Pull Request* indicando el perfil del aporte (fiscal / código / web / divulgación).

Para auditorías normativas, incluye siempre la referencia legal (BOE, artículo, disposición).

## ⚖️ Aviso legal

Este proyecto tiene fines educativos, divulgativos y de análisis económico. Aunque el algoritmo sigue minuciosamente la normativa de la AEAT y la Seguridad Social española, los resultados son orientativos y no sustituyen el consejo de un profesional fiscal o un graduado social.

## 📝 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE`.
