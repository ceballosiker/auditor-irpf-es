# 06. Escala progresiva y mínimo personal

> Sobre la base imponible se aplica la **escala IRPF progresiva**. El mínimo personal se descuenta **como cuota** al tipo del primer tramo, no como deducción de la base — un detalle conceptualmente importante que ya estaba en la reforma Montoro de 2015.

## La escala progresiva

La base imponible se divide en tramos. Cada tramo tributa a su tipo, y la cuota íntegra es la suma:

```
cuota_íntegra = Σ (base_en_tramo_i × tipo_i)
```

El motor modela los tramos **estatales** y, bajo el supuesto del proyecto (_tramo autonómico = tramo estatal_), los duplica. Así, los porcentajes que ves a continuación son los **totales aplicables** (estatal × 2).

### Tramos por periodo

#### 2012–2014

| Hasta (€) | Tipo total |
| --------: | ---------: |
|    17 707 |    24,75 % |
|    33 007 |    30,00 % |
|    53 407 |    40,00 % |
|   120 000 |    47,00 % |
|   175 000 |    49,00 % |
|   300 000 |    51,00 % |
|         ∞ |    52,00 % |

Periodo de "complementos transitorios" del IRPF (mucha progresividad y un tipo marginal alto del 52 %).

#### 2015 (reforma Montoro, año 1)

| Hasta (€) | Tipo total |
| --------: | ---------: |
|    12 450 |    19,50 % |
|    20 200 |    24,50 % |
|    34 000 |    30,50 % |
|    60 000 |    38,00 % |
|         ∞ |    46,00 % |

Reducción notable de tramos (de 7 a 5) y del tipo marginal (52 → 46 %).

#### 2016–2020

| Hasta (€) | Tipo total |
| --------: | ---------: |
|    12 450 |    19,00 % |
|    20 200 |    24,00 % |
|    35 200 |    30,00 % |
|    60 000 |    37,00 % |
|         ∞ |    45,00 % |

Ligera bajada respecto a 2015.

#### 2021–2026

| Hasta (€) | Tipo total |
| --------: | ---------: |
|    12 450 |    19,00 % |
|    20 200 |    24,00 % |
|    35 200 |    30,00 % |
|    60 000 |    37,00 % |
|   300 000 |    45,00 % |
|         ∞ |    47,00 % |

Reintroducción de un tramo alto del 47 % a partir de 300 000 €.

## El mínimo personal: cuota, no base

A diferencia de muchos otros impuestos, el IRPF español **no resta el mínimo personal de la base** antes de aplicar la escala. En su lugar:

1. Se calcula la cuota íntegra sobre la base imponible completa.
2. Se calcula una "cuota equivalente" del mínimo personal, multiplicándolo por el **tipo del primer tramo**.
3. La cuota teórica es `max(0, cuota_íntegra − cuota_mínimo_personal)`.

```
cuota_mínimo_personal = mínimo_personal × tipo_primer_tramo
cuota_teórica         = max(0, cuota_íntegra − cuota_mínimo_personal)
```

Valores del **mínimo personal del contribuyente** (soltero, sin hijos, sin discapacidad, < 65 años):

| Periodo   | Mínimo personal |
| --------- | --------------: |
| 2012–2014 |         5 151 € |
| 2015–2026 |         5 550 € |

> **¿Por qué cuota y no base?** Aplicar el mínimo como cuota al tipo más bajo es **más equitativo**: si se restara de la base, las rentas altas obtendrían un ahorro mayor (porque "esquivarían" el último tramo, no el primero). Aplicado como cuota, el ahorro es el mismo en valor absoluto para todos los contribuyentes con la misma situación personal.

## Posición en la cadena

```
base_imponible  = max(0, ren_neto − reducción_Art_20)        ← paso 05/06
cuota_íntegra   = Σ tramos × base_en_cada_tramo              ← este paso
cuota_teórica   = max(0, cuota_íntegra − mín_personal × t1)  ← este paso
```

## En el código

- Tabla `tramosIRPFDe` por periodo: [`src/normativa.ts` L144–182](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/normativa.ts#L144-L182).
- Mínimo personal por periodo (`irpfMinimo`): [`src/normativa.ts` L236](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/normativa.ts#L236).
- Cálculo `calcularCuotasPorTramo`: [`src/pipeline.ts` L49–71](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/pipeline.ts#L49-L71).
- Mínimo personal aplicado al tipo del primer tramo: [`src/pipeline.ts` L96–99](https://github.com/ceballosiker/auditor-irpf-es/blob/cd051e2/src/pipeline.ts#L96-L99).

---

Anterior: [05. Reducción Art. 20](05-art-20.md) · Siguiente: [07. Deducción SMI y tope 43 %](07-smi-y-43.md).
