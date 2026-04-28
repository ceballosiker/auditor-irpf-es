# Progresividad en frío

> Cuando los **tramos** y las **deducciones** del IRPF están fijados en valores nominales (€) y el **salario nominal sube** —aunque solo sea para compensar inflación—, el contribuyente sube de tramo o pierde reducciones **sin que el legislador haya cambiado nada**. El efecto neto es una subida de impuestos no votada.

## La idea

Imagínate una escala fiscal sencilla: hasta 12 450 € se paga el 19 %, a partir de ahí el 24 %. Estos dos tramos no se han movido en España desde 2016.

Si en 2016 ganas 12 000 € y en 2026 ganas 14 000 €, has subido **en términos nominales**. Pero si la inflación entre 2016 y 2026 ha sido del 30 % (aproximadamente el caso real), tu **poder adquisitivo real** ha **bajado**: 14 000 € de 2026 valen aproximadamente 10 800 € de 2016.

Y como los tramos no se han movido, ahora estás pagando una parte de tu salario al 24 %, mientras que en 2016 todo lo pagabas al 19 %. **Tu fiscalidad real ha subido sin que nadie haya cambiado la ley.**

A esto se le llama **progresividad en frío** (_bracket creep_ en inglés): la progresividad fiscal funciona "en frío" sobre un salario que solo ha crecido en frío (nominal), no en términos de poder de compra.

## Por qué es importante

- Es una **subida de impuestos automática**, no debatida en parlamento.
- Afecta más a las **rentas medias y bajas**, donde los tramos cambian con más frecuencia y el salto entre uno y otro tiene más peso relativo.
- En periodos de inflación alta (2021–2023 en España, con IPC acumulado >15 %), el efecto se acelera dramáticamente.
- Algunos países lo combaten **deflactando los tramos** automáticamente cada año (Alemania desde 2010, Francia indiciariamente, Estados Unidos vía CPI desde 1985). España **no lo hace**: las actualizaciones de tramos cuando ocurren son políticas, ad hoc y rara vez compensan la inflación.

## Cómo lo modela este motor

El motor incluye una serie histórica de **IPC anual de diciembre a diciembre** (fuente: INE):

| Año  | IPC anual (Dic/Dic) | Multiplicador acumulado a 2026 |
| ---- | ------------------: | -----------------------------: |
| 2013 |              +0,3 % |                         1,3052 |
| 2014 |              −1,0 % |                         1,3184 |
| 2015 |               0,0 % |                         1,3184 |
| 2016 |              +1,6 % |                         1,2976 |
| 2017 |              +1,1 % |                         1,2835 |
| 2018 |              +1,2 % |                         1,2683 |
| 2019 |              +0,8 % |                         1,2582 |
| 2020 |              −0,5 % |                         1,2645 |
| 2021 |              +6,5 % |                         1,1874 |
| 2022 |              +5,7 % |                         1,1233 |
| 2023 |              +3,1 % |                         1,0895 |
| 2024 |              +2,8 % |                         1,0599 |
| 2025 |              +2,9 % |                         1,0300 |
| 2026 |              +3,0 % |                         1,0000 |

El **multiplicador acumulado a 2026** se calcula encadenando `(1 + IPC[a])` desde el año siguiente al año base hasta 2026. Un euro de 2012 son 1,3091 € de 2026; un euro de 2020 son 1,2645 € de 2026.

La **pestaña `COMPARATIVA_INFLACION`** del Excel auditor (y los gráficos de las páginas siguientes) usan esta serie para deflactar e inflactar netos entre años, midiendo así la pérdida (o ganancia) de poder adquisitivo real con la fiscalidad de cada año.

## Un ejemplo concreto: 30 000 € nominales sin subida

Una persona que gana **30 000 € nominales** en cada año entre 2012 y 2026 — sin subidas, ni siquiera para compensar inflación — vive en términos reales una **caída sostenida** de poder adquisitivo:

| Año  | Bruto nominal | **Bruto en € de 2026** | Neto nominal | **Neto en € de 2026** | Tipo medio efectivo |
| ---- | ------------: | ---------------------: | -----------: | --------------------: | ------------------: |
| 2012 |        30 000 |             **39 273** |       22 667 |            **29 673** |             24,44 % |
| 2015 |        30 000 |             **39 551** |       23 053 |            **30 392** |             23,16 % |
| 2018 |        30 000 |             **38 048** |       23 156 |            **29 367** |             22,81 % |
| 2022 |        30 000 |             **33 700** |       23 156 |            **26 011** |             22,81 % |
| 2024 |        30 000 |             **31 796** |       23 130 |            **24 515** |             22,90 % |
| 2026 |        30 000 |             **30 000** |       23 124 |            **23 124** |             22,92 % |

Lo más llamativo no es la columna del **tipo medio efectivo** —que de hecho ha bajado ligeramente gracias a algunas reformas—, sino la última columna numérica: **el neto en € de 2026 cae de 29 673 € a 23 124 €** entre 2012 y 2026. Eso son **6 549 € reales menos** de poder adquisitivo, **un 22 % menos**, sin que el contribuyente haya cambiado de empleo, ni de bruto.

Una parte de esa caída es por inflación pura (su salario perdió valor). La otra parte es lo que la **progresividad en frío** habría agravado de no ser por reformas puntuales que recortaron tramos y subieron reducciones.

<!-- CHART: "neto-real-mismo-nominal" — eje X: año (2012–2026); eje Y: neto en € de 2026; serie única (bruto nominal = 30 000 €). Pendiente decreciente que ilustra el ejemplo de la tabla anterior. -->

## Otra mirada: mismo poder de compra a través del tiempo

Otra forma de ver el efecto es preguntarse: si yo gano hoy lo equivalente a un poder adquisitivo X (medido en € de 2026), ¿qué neto real me habría quedado con la fiscalidad de cada año?

Esta vez **fijamos el bruto real**, no el nominal — el sueldo se actualiza año a año en línea con el IPC.

<!-- CHART: "neto-real-bruto-real-fijo" — eje X: bruto en € de 2026 (15 000–80 000 €); eje Y: neto en € de 2026; una serie por año (2012, 2015, 2018, 2022, 2024, 2026). El espaciado vertical entre líneas mide el efecto neto de las reformas + progresividad en frío. -->

<!-- CHART: "tipo-medio-efectivo" — eje X: bruto en € de 2026 (15 000–80 000 €); eje Y: tipo medio efectivo (cot. trabajador + IRPF) / bruto, en %; una serie por año (2012, 2015, 2018, 2022, 2024, 2026). Permite ver dónde tributa hoy más quien antes tributaba menos. -->

## Cuándo se nota más

- **Brutos justo por encima de un salto de tramo**: una pequeña subida nominal te puede empujar al siguiente tramo, donde el tipo marginal es notablemente mayor.
- **En la zona del Art. 20** (la reducción por rendimientos del trabajo, ver página [05. Reducción Art. 20](motor/05-art-20.md)): si tu rendimiento previo cae cerca del codo `uSup`, una subida nominal pequeña puede hacer que pierdas reducción rápidamente.
- **Cerca del mínimo exento de retención** (ver [07. SMI y tope 43 %](motor/07-smi-y-43.md)): subir nominalmente por encima del umbral introduce retención donde antes no la había.

## En el código

- Tabla `IPC_ANUAL_DIC` (IPC INE de Dic/Dic, 2013–2026): [`src/inflacion.ts` L7–22](https://github.com/ceballosiker/auditor-irpf-es/blob/5b70e47/src/inflacion.ts#L7-L22).
- Función `inflacionAcumulada(anioBase, anioDestino=2026)`: [`src/inflacion.ts` L24–39](https://github.com/ceballosiker/auditor-irpf-es/blob/5b70e47/src/inflacion.ts#L24-L39).
- Cache `INFLACION_A_2026` precomputada: [`src/inflacion.ts` L42–48](https://github.com/ceballosiker/auditor-irpf-es/blob/5b70e47/src/inflacion.ts#L42-L48).
- En el Excel: pestaña `COMPARATIVA_INFLACION` (función `buildComparativaInflacion` en [`src/excel.ts` L66](https://github.com/ceballosiker/auditor-irpf-es/blob/5b70e47/src/excel.ts#L66); barre brutos de 15 000 a 100 000 € en pasos de 1 000 €, en € de 2026 — ver [`src/excel.ts` L13–17](https://github.com/ceballosiker/auditor-irpf-es/blob/5b70e47/src/excel.ts#L13-L17)).

---

Volver al [inicio del manual](index.md) · Ver el [motor de cálculo](motor/01-cotizacion.md) paso a paso.
