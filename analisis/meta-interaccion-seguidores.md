# Campaña de interacción — análisis contra su objetivo real (seguidores)

**Caramés Lanús Este** · 27/08/2026 · cuenta `act_934514726949339`
Campaña `120242711767330378` «Campaña de interacción» (`OUTCOME_ENGAGEMENT`,
activa desde 08/04/2026, $7.500 ARS diarios)

Informe visual: https://claude.ai/code/artifact/96e3277d-31f8-4da8-9c22-7d68992e0c4d

> **Solo lectura.** No se pausó, activó ni modificó ninguna campaña, conjunto,
> anuncio, presupuesto ni segmentación.

---

## Veredicto

La campaña no está estancada: está empeorando, y el tablero de Meta informa lo
contrario porque mide otra cosa.

| | Semana del 29/05 | Semana del 21/08 |
|---|---:|---:|
| Seguidores nuevos | 234 | 89 |
| Inversión | $68.532 | ~$70.000/sem promedio |
| **Costo real por seguidor** | **$293** | **$762** (pico $885 el 07/08) |
| Costo por resultado que informa Meta | $30,11 | $9,51 |
| Visita al perfil → seguidor | 10,28% | 1,25% |

## Causa raíz: el objetivo mide visitas, no seguidores

Los dos conjuntos activos optimizan por `PROFILE_AND_PAGE_ENGAGEMENT`, cuyo
resultado es `total_profile_visits` («Visitas al perfil y a la página»).
Seguidores no forma parte del objetivo.

Desde el 24/07 Meta encontró visitas al perfil mucho más baratas y movió el
presupuesto hacia ellas. Cumplió su objetivo al pie de la letra: las visitas
pasaron de ~2.300 a ~9.700 por semana. Pero esas visitas casi no dejan
seguidores.

## Serie semanal

| Semana | Gasto | Clics | CTR | CPC | Seguidores | Visitas | $/seg | vis→seg |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 29/05–04/06 | 68.532 | 2.320 | 3,59% | 29,5 | 234 | 2.276 | 293 | 10,28% |
| 05–11/06 | 72.391 | 2.505 | 4,27% | 28,9 | 174 | 2.398 | 416 | 7,26% |
| 12–18/06 | 68.425 | 2.348 | 4,77% | 29,1 | 156 | 1.955 | 439 | 7,98% |
| 19–25/06 | 69.903 | 2.745 | 5,09% | 25,5 | 119 | 2.619 | 587 | 4,54% |
| 26/06–02/07 | 71.059 | 2.749 | 5,11% | 25,8 | 146 | 2.575 | 487 | 5,67% |
| 03–09/07 | 69.590 | 3.120 | 5,73% | 22,3 | 142 | 3.029 | 490 | 4,69% |
| 10–16/07 | 68.765 | 2.727 | 4,96% | 25,2 | 162 | 2.586 | 424 | 6,26% |
| 17–23/07 | 69.631 | 2.821 | 5,50% | 24,7 | 166 | 2.656 | 419 | 6,25% |
| **24–30/07** | 74.618 | 5.671 | **9,05%** | **13,2** | 122 | 5.661 | 612 | **2,16%** |
| 31/07–06/08 | 66.312 | 7.420 | 11,03% | 8,9 | 88 | 7.528 | 754 | 1,17% |
| 07–13/08 | 70.785 | 6.695 | 10,92% | 10,6 | 80 | 6.745 | 885 | 1,19% |
| 14–20/08 | 92.243 | 9.597 | 12,10% | 9,6 | 121 | 9.703 | 762 | 1,25% |
| 21–26/08* | 50.466 | 4.673 | 12,19% | 10,8 | 89 | 4.697 | 567 | 1,89% |

\* seis días, no siete.

El quiebre es la semana del 24/07: el CTR salta de 5,50% a 9,05% y el CPC cae
de $24,68 a $13,16.

## Causa 1 — el presupuesto se mudó entero a Reels

| Ubicación | % gasto antes | $/seg antes | % gasto ahora | $/seg ahora | vis→seg ahora |
|---|---:|---:|---:|---:|---:|
| Instagram Reels | 32,9% | $390 | **94,1%** | **$833** | 1,15% |
| Instagram Stories | 45,7% | $427 | 3,3% | **$237** | 5,76% |
| Instagram Feed | 12,3% | $305 | 1,8% | **$176** | 7,29% |
| Facebook Feed | 7,0% | $13.049 | 0,4% | sin seguidores | 0% |
| Facebook Reels | 2,1% | $5.866 | 0,5% | sin seguidores | 0% |
| **Total** | $558.295 | $430 | $310.692 | **$731** | 1,33% |

(«Antes» = 29/05–23/07; «ahora» = últimos 30 días.)

Las dos ubicaciones defondeadas son hoy las más baratas por seguidor. Las
ubicaciones están en automático (`targeting_optimization: expansion_all`,
`advantage_audience: 1`), así que el reparto lo decide Meta.

## Causa 2 — el mejor anuncio está pausado

| Anuncio | Creado | Estado | Gasto | Seg. | $/seg | vis→seg | ve video 100% |
|---|---|---|---:|---:|---:|---:|---:|
| Del Valle Iberlucea 3155 | 18/05 | pausado | 25.094 | 117 | **214** | 15,29% | 1,54% |
| Riobamba 107 | 21/08 | activo | 7.451 | 23 | 324 | 4,17% | 2,05% |
| Basavilbaso 1960-2D | 02/06 | pausado | 54.342 | 149 | 365 | 8,16% | 1,43% |
| Córdoba 920 | 14/07 | pausado | 73.584 | 192 | 383 | 6,28% | 3,62% |
| Juncal 2228 | 23/04 | pausado | 47.883 | 117 | 409 | 8,07% | 2,55% |
| Margarita Weild 1432 | 11/06 | pausado | 53.800 | 121 | 445 | 7,88% | 1,06% |
| Sarmiento 1524 | 01/07 | activo | 53.218 | 113 | 471 | 3,69% | 3,27% |
| **Basavilbaso 1665 1A** | 19/06 | **pausado** | 195.079 | **394** | 495 | 4,10% | 1,84% |
| Guido 2191 | 26/06 | activo | 41.656 | 69 | 604 | 3,67% | 1,66% |
| **Blanco Encalada 2396** | 30/07 | activo | 164.109 | 217 | **756** | 1,29% | 1,08% |
| **Córdoba 2056** | 14/08 | activo | 83.908 | 96 | **874** | 1,06% | 1,10% |

- 6 pausados: $449.782 → 1.090 seguidores = **$413** c/u, vis→seg 5,97%
- 5 activos: $350.342 → 518 seguidores = **$676** c/u, vis→seg 1,65%

`Basavilbaso 1665 1A` es el anuncio que más seguidores trajo de toda la campaña
y está frenado. `Blanco Encalada 2396` se creó el 30/07, que es exactamente
donde quiebran las curvas.

Los dos anuncios que hoy concentran el presupuesto tienen 1,1% de reproducción
completa; los buenos están entre 2,5% y 3,6%.

## Causa 3 — Facebook

Sumando ambos períodos, Facebook Feed + Facebook Reels consumieron **$53.580**
y produjeron **5 seguidores** ($10.716 cada uno), con CTR de 10% a 22,68%. Ese
patrón de clic altísimo con resultado nulo es toque accidental.

## Qué revisar (no ejecutado)

1. Por qué se pausó `Basavilbaso 1665 1A`, y con qué reemplazarlo.
2. Cambiar el KPI de seguimiento a `instagram_profile_follow_v2` en lugar del
   «costo por resultado» de Meta.
3. Evaluar sacar Feed y Stories de la competencia por presupuesto con Reels.
4. Revisar el primer segundo de los creativos activos (retención).

## Fuentes y salvedades

- Meta Marketing API vía las herramientas de Ads, todas de lectura.
- Seguidores: `instagram_profile_follow_v2`. Visitas: `total_profile_visits`.
- El historial de cambios de la cuenta (`ads_account_get_activity_logs`) no está
  habilitado todavía para esta cuenta, así que no se pudo confirmar quién pausó
  cada anuncio ni cuándo. Las fechas de creación y los quiebres en las series
  son evidencia circunstancial, sólida pero indirecta.
- La atribución de seguidores no incluye a quien descubrió la cuenta por un
  anuncio y la siguió días después de forma orgánica.
