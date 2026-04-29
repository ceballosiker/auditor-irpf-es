# 03. MEI y Cuota de Solidaridad

> Dos mecanismos relativamente nuevos que se acoplan a la cotización ordinaria: el **MEI** (sobre la misma base, desde 2023) y la **Cuota de Solidaridad** (sólo sobre el exceso por encima de `baseMax`, desde 2025).

## Mecanismo de Equidad Intergeneracional (MEI)

Introducido por la Ley 21/2021 para reforzar el Fondo de Reserva de la SS. Es una **cotización adicional** sobre la **misma base de cotización** que las cuotas ordinarias, con un tipo que escala año a año durante la "década del baby boom":

| Año  | Tipo total MEI | Empresa | Trabajador |
| ---- | -------------: | ------: | ---------: |
| 2023 |         0,60 % |  0,50 % |     0,10 % |
| 2024 |         0,70 % |  0,58 % |     0,12 % |
| 2025 |         0,80 % |  0,67 % |     0,13 % |
| 2026 |         0,90 % |  0,75 % |     0,15 % |

Reparto: **5/6 empresa · 1/6 trabajador**.

El motor lo absorbe directamente en `tipo_empresa_total` y `tipo_trabajador_total`, así que en la fórmula del paso 02 no aparece como una línea aparte: ya está sumado.

## Cuota de Solidaridad

Introducida por el RD-ley 2/2023 con efectos desde el **1 de enero de 2025**. La idea es que las rentas que **superan** la base máxima (y que por tanto no pagaban cotización ordinaria sobre el exceso) sí contribuyan, en una franja escalonada, sobre ese exceso.

Sólo aplica al **exceso** = `bruto − baseMax`. Tres bandas, definidas como **multiplicadores de `baseMax`**:

| Banda | Sobre qué se aplica                        | Tipo 2025 | Tipo 2026 |
| ----- | ------------------------------------------ | --------: | --------: |
| 1     | Exceso hasta `0,1 × baseMax`               |    0,92 % |    1,15 % |
| 2     | Exceso entre `0,1·baseMax` y `0,5·baseMax` |    1,00 % |    1,25 % |
| 3     | Exceso por encima de `0,5·baseMax`         |    1,17 % |    1,46 % |

Reparto: **5/6 empresa · 1/6 trabajador**, igual que el MEI.

## Ejemplo combinado (2026, bruto = 80 000 €)

Datos: `baseMax` = 61 214,40 €, exceso = 18 785,60 €.

**MEI** (sobre la base de 61 214,40 €):

- Empresa: 61 214,40 × 0,75 % = **459,11 €**.
- Trabajador: 61 214,40 × 0,15 % = **91,82 €**.

**Solidaridad** (sobre el exceso de 18 785,60 €):

- Banda 1 (hasta `0,1·baseMax` = 6 121,44 €): 6 121,44 × 1,15 % = 70,40 €.
- Banda 2 (entre 6 121,44 y `0,5·baseMax` = 30 607,20 €, pero el exceso sólo llega a 18 785,60): 18 785,60 − 6 121,44 = 12 664,16 € a 1,25 % = 158,30 €.
- Banda 3 (no aplica: el exceso no supera `0,5·baseMax`).
- **Cuota total** Solidaridad = 70,40 + 158,30 = **228,70 €**.
- Empresa (5/6) = **190,58 €** · Trabajador (1/6) = **38,12 €**.

## En el código

- Tipos MEI por año: [`src/normativa.ts` L61–67](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/normativa.ts#L61-L67).
- Bandas Solidaridad por año: [`src/normativa.ts` L69–85](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/normativa.ts#L69-L85).
- Cálculo de la cuota Solidaridad: [`src/pipeline.ts` L19–47](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/pipeline.ts#L19-L47).
- Reparto 5/6 · 1/6: constantes `REPARTO_SOLIDARIDAD_EMPRESA` / `_TRABAJADOR` en [`src/pipeline.ts` L20–21](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/pipeline.ts#L20-L21).

---

Anterior: [02. Tipos SS](02-ss.md) · Siguiente: [04. Gastos fijos Art. 19](04-art-19.md).
