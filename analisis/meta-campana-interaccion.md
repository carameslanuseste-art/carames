# Diagnóstico — Campaña de interacción de Meta Ads

> **Nota (27/08/2026, posterior).** Este informe evalúa la campaña de interacción
> contra tasaciones y captaciones. Ese no es su objetivo: la campaña está pensada
> para sumar seguidores. El análisis correcto de esa campaña, medida contra su
> propio objetivo, está en `meta-interaccion-seguidores.md`. Lo de acá abajo sigue
> siendo válido para el resto de la cuenta y para el circuito de leads, no como
> juicio sobre la campaña de interacción.

**Caramés Bienes Raíces, Sucursal Lanús Este** · análisis del 27/08/2026
Informe visual: https://claude.ai/code/artifact/719365e2-f009-4a72-8599-ffc491b583bd

---

## Veredicto

| | |
|---|---|
| Invertido en Meta (julio + agosto) | ~$1.698.687 ARS |
| Leads únicos generados | 472 |
| Tasaciones agendadas originadas en Meta | **0** |
| Captaciones originadas en Meta | **0** |

Ninguna de las 35 tasaciones registradas desde febrero coincide, por teléfono
normalizado, con un lead de Meta.

## Números de campaña — semana al 24/08/2026

| Métrica | Interacción | Leads · Compradores |
|---|---:|---:|
| Inversión | $91.196 | $104.817 |
| Impresiones | 75.580 | 23.668 |
| Clics | 9.237 | 1.590 |
| CTR | 12,22% | 6,72% |
| Costo por clic | $9,9 | $65,9 |
| Conversaciones iniciadas | 53 | 48 |
| Clic → conversación | **0,57%** | **3,02%** |
| Costo por conversación | $1.721 | $2.184 |
| Tasaciones agendadas | 0 | 0 |

Julio (mes cerrado): $942.637, 676 conversaciones, 437 leads de formulario,
26.087 clics, 430.530 impresiones.

## Causas

### 1. La campaña trae compradores; el negocio necesita vendedores

De los 113 leads únicos de Meta de agosto:

- 93,8% busca «Vivienda», 5,3% «Inversión»
- **72,6% declara NO tener propiedad para vender**
- 78,8% tiene presupuesto por debajo de USD 100.000

Comparación con Google Ads en el mismo período: 26 de 26 leads piden TASACIÓN y
26 de 26 declaran tener propiedad para vender. Dos de las 12 tasaciones de agosto
salieron de ahí.

### 2. El objetivo `OUTCOME_ENGAGEMENT` compra la métrica equivocada

Un CPC de $9,9 contra $65,9 y un CTR del 12,22% no son eficiencia: son la firma
de clics de baja intención. La campaña gana el CTR por casi el doble y pierde la
conversión clic→conversación por 5,3 veces.

El plan documentado del negocio (`campanas_meta_tiktok_carames.docx`) recomienda
objetivo **Leads**, no Interacción.

### 3. El seguimiento no llega a tiempo

| Cohorte | Total | Resultado |
|---|---:|---|
| Julio | 354 | 325 (91,8%) «Vencido (sin contactar a tiempo)» |
| Agosto | 113 | 44 (38,9%) «Sin contestar»; 96 de 113 contactados una sola vez |

De los **31 leads de agosto que sí declararon tener propiedad para vender**,
**18 están en «Sin contestar»** — 14 entraron del 21/08 en adelante.

El escenario de Make `Carames DM - Seguimiento suave ventas (18hs)` (id 5795614)
está **desactivado**.

### 4. El informe semanal refuerza el error

El análisis automático del 24/08 concluye textualmente:

> «Te recomendaría reasignar parte del presupuesto de la campaña "Compradores -
> Formulario" hacia la campaña de interacción, ya que esta última está trayendo
> más leads a menor costo.»

El informe compara costo por conversación y nunca mira tasaciones, así que
siempre va a premiar a la campaña que compra el tráfico más barato.

## Descartado como causa

Segmentación geográfica: 96,5% de los leads de agosto son del AMBA
(por característica telefónica). Solo 4 de 113 cayeron fuera de zona.

## Acciones recomendadas

1. **Hoy** — Contactar a los 18 propietarios en «Sin contestar»; empezar por los
   7 que entraron del 25/08 en adelante.
2. ~~Pausar la campaña de interacción.~~ **Corregido:** esa campaña existe para
   sumar seguidores, no tasaciones, así que no corresponde juzgarla ni pausarla
   por este informe. Ver `meta-interaccion-seguidores.md`.
3. **Al reemplazar** — Campaña con objetivo Leads y formulario de vendedor.
   Cambiar el gancho de «encontrá tu vivienda» a «cuánto vale tu propiedad».
4. **De fondo** — Cambiar el KPI del informe semanal a tasaciones agendadas por
   canal y costo por tasación. Reactivar el escenario de seguimiento de las 18hs.

## Fuentes

- Métricas de campaña: cuenta `act_934514726949339` vía el escenario de Make
  «Carames - Meta Ads ROI semanal» (id 5464268) y el datastore 120359
  (claves `metaads`, `snapshot_meta`, `snapshot_meta_sem`).
- Leads, estados y tasaciones: planilla `Carames_Leads_DM`
  (`1XdeAM46_SQFt7H2fcWlQa5KFtZy3U-fLcSOlMgUiKx0`), leída el 27/08/2026.
- Atribución: cruce de teléfonos normalizados (últimos 8 dígitos, sin prefijos
  54/9/11) entre tasaciones y leads de cada canal. Ver `analizar_leads.py`.

## Salvedades

- La inversión de agosto está estimada proyectando $196.013/semana sobre 27 días.
- El cruce por teléfono no captura a alguien que haya visto un anuncio de Meta y
  después haya llamado desde otra línea: es un piso, no un techo. Aun así, cero
  coincidencias sobre 472 leads y 35 tasaciones no se explica por atribución
  perdida.
