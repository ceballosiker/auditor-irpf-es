# 01. Base de cotización y tope

> Primer paso de la cadena: decidir sobre qué cantidad del salario se cotiza a la Seguridad Social.

## La idea

La **base de cotización** es la cantidad sobre la que se aplican los tipos de Seguridad Social. Para una persona asalariada con un único pagador, en términos prácticos:

- Si el salario bruto anual es **menor o igual** a la base máxima de cotización (`baseMax`), entonces la base de cotización **es** el salario bruto.
- Si el salario bruto **supera** `baseMax`, la base de cotización se queda **topada** en `baseMax`. El exceso (`bruto − baseMax`) no cotiza por las cuotas ordinarias, pero a partir de 2025 **sí** atrae la [Cuota de Solidaridad](03-mei-solidaridad.md#cuota-de-solidaridad).

En fórmula:

```
base_cotizacion = min(bruto, baseMax)
exceso          = max(0, bruto − baseMax)
```

## La base máxima año a año

La base máxima la fija la Ley de PGE de cada año (o, en su defecto, la prórroga). Estos son los valores anuales que usa el motor:

| Año  | `baseMax` (€) |
| ---- | ------------: |
| 2012 |     39 150,00 |
| 2013 |     41 108,40 |
| 2014 |     43 164,00 |
| 2015 |     43 272,00 |
| 2016 |     43 704,00 |
| 2017 |     45 014,40 |
| 2018 |     45 014,40 |
| 2019 |     48 841,20 |
| 2020 |     48 841,20 |
| 2021 |     48 841,20 |
| 2022 |     49 672,80 |
| 2023 |     53 946,00 |
| 2024 |     56 646,00 |
| 2025 |     58 914,00 |
| 2026 |     61 214,40 |

Se publica como base mensual; aquí está prorrateada al año (12 mensualidades + 2 pagas extras incluidas en la base, según la práctica habitual).

## Ejemplo (2026)

`baseMax` 2026 = **61 214,40 €**.

| Bruto anual | Base de cotización |      Exceso |
| ----------: | -----------------: | ----------: |
|    40 000 € |        40 000,00 € |         0 € |
|    60 000 € |        60 000,00 € |         0 € |
|    80 000 € |        61 214,40 € | 18 785,60 € |
|   150 000 € |        61 214,40 € | 88 785,60 € |

## En el código

- Tabla `BASE_MAX_POR_ANIO`: [`src/normativa.ts` L17–33](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/normativa.ts#L17-L33).
- Cálculo de `base_cotizacion` y `exceso`: [`src/pipeline.ts` L79–80](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/pipeline.ts#L79-L80).

---

Siguiente: [02. Tipos de Seguridad Social](02-ss.md).
