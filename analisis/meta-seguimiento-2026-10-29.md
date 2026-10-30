# Meta Ads — Seguimiento de cambios y pendientes

**Caramés Bienes Raíces, Sucursal Lanús Este** · cuenta `act_934514726949339` · sesión del 29/10/2026
Análisis completo que originó esto: `meta-analisis-2026-10-29.md`. Brief para las CM: `Brief creativos - Meta Ads - Nov 2026.docx`.

---

## 1. Cambios aplicados en la cuenta (29/10, verificados en vivo)

| Cambio | Estado |
|---|---|
| Campaña Vendedores - Tasación - Formulario (`120250420744800378`) | **Pausada** (ARS 72.326 para 5 formularios, ARS 14.465 c/u) |
| Compradores - WPP (`120250280302560378`) | Presupuesto **ARS 5.000/día** (antes 10.000) |
| Conjuntos reconocimiento compradores (`120250196003320378`) y alquileres (`120250447203430378`) | **Pausados** |
| Campaña de reconocimiento (`120250196003310378`) | **ARS 3.100/día** (mínimo de Meta: 3.041). Conjunto vendedores (`120250447203420378`) con mínimo diario ARS 1.000; el resto va a "Refuerzo – Ya interactuaron" |
| Compradores - Formulario (`120248260200030378`) | Presupuesto **ARS 14.000/día** (antes 10.000) |
| DEPTO 1 - FORMULARIO con marcador a 8 km | **Rechazado por Meta**: categoría especial de vivienda exige 17 km mínimo desde ciudad, dirección o marcador. Sin cambios. Quedó un borrador idéntico al vivo (descartar en Ads Manager) |

Presupuesto diario activo tras los cambios: 14.000 + 5.000 + 5.000 (IG) + 3.100 = **ARS 27.100/día** (antes 35.000). Los 5.000 de Vendedores vuelven cuando se publique la campaña nueva.

## 2. Campaña nueva de Vendedores (en borrador, sin publicar)

- Campaña `120250447392610378` "Vendedores - Tasación - Wpp": objetivo Leads, ARS 5.000/día (CBO), categoría especial HOUSING / AR, estado PAUSED.
- Conjunto `120250730423450378` "Vendedores - Lanús - WhatsApp": optimiza conversaciones, destino WhatsApp de la página `108052454036434`, Lanús + 17 km, Advantage+ con sugerencia 35-65.
- **Falta el anuncio**: pieza A1 del brief (imagen "¿Cuánto vale tu propiedad en Lanús Este?"). Cuando llegue, crear creativo + anuncio y publicar campaña, conjunto y anuncio juntos.
- Mientras no haya API de WhatsApp: atención manual en la app, mensaje de bienvenida, etiqueta "Meta Vendedores", carga diaria a Leads Captación.
- Regla de corte: 7 días; si costo por conversación > ARS 3.000, cambiar creatividad; > 5.000, cambiar oferta.

## 3. Cambios en Make

- **`5541462` Leads Formulario -> Base de datos** (compradores, activo): el trigger de Facebook Lead Ads ahora pide `ad_id, ad_name, adset_id, adset_name, campaign_id, campaign_name, created_time, field_data, form_id, platform`. Variables nuevas en el módulo 30: `campana`, `conjunto`, `anuncio` (mapeadas a `1.campaignName`/`1.campaign_name`, etc.). Se escriben en Leads Meta columnas I (campaña) y J (anuncio) y en el texto de notas de `_BANDEJA` (col. 11). **Pendiente verificar con el primer lead real** que las columnas vengan con datos; si vienen vacías, el nombre del campo de salida es otro.
- **`5464268` Meta Ads ROI semanal** (lunes 8:05): nuevo system prompt con 4 reglas (no comparar conversaciones con formularios ni recomendar mover presupuesto; juzgar cada campaña por su objetivo; alertar saltos > 30%; recomendar solo creatividades/frecuencia). Primera corrida con reglas nuevas: lunes 2/11.
- **`6706078` Leads Vendedores (Meta) -> Base**: sin cambios (la campaña de formulario está pausada).
- **`6684379` SN WA · WhatsApp → planilla**: sin cambios. Webhook `https://hook.us2.make.com/8mnlhdf1sobd6uewgidn5g8wjka18swa` (habilitado, cola vacía). La pestaña `_WA_EVENTOS` solo tiene una prueba del 18/10: **la API de WhatsApp todavía no está en producción**.
- **`5795614` Seguimiento suave ventas (18hs)**: inactivo y a medio hacer (token de ManyChat sin cargar, es un seguimiento de DMs de Instagram, no de leads de Meta). No activar hasta terminarlo.

## 4. Hallazgos sobre el sistema nuevo

- "Visita agendada" ya existe: SN 5 (`6148251`) clasifica eventos de calendario en tasación / visita / reserva / boleto / escritura y los deja en `_BANDEJA`. Lo que falta es el **vínculo con el lead**: las filas de calendario entran sin teléfono. Regla: el celular del cliente va en el título o descripción del evento.
- Atribución de WhatsApp: el aviso de 360dialog trae `referral.source_id` (ID del anuncio) cuando el contacto llega desde un anuncio. El escenario guarda el aviso completo; el sistema debe leer ese campo.
- `_BANDEJA` col. 11 ya lleva `anuncio {adId}` desde antes; `CARAMÉS — Base` tiene la pestaña `_ANUNCIOS_META`, así que el cruce por ID de anuncio es posible sin tocar Make.

## 5. Línea de base para la revisión del 12/11 (últimos 90 días al 28/10)

| Campaña | Gasto ARS | Resultado | Costo/resultado | Frecuencia |
|---|---|---|---|---|
| Compradores - Formulario | 1.119.574 | 902 formularios | 1.241 | 3,53 |
| · conjunto PH 1 | 300.624 | 233 | 1.290 | 3,18 (fatigado, conversión -62%) |
| Compradores - WhatsApp | 224.877 | 392 conversaciones | 574 (semanal: 409 → 633) | 4,44 |
| Seguidores IG - interacción | 275.177 | 13.982 visitas perfil | 19,68 | 2,52 |
| · Alquileres - IG | 145.554 | 7.898 visitas · 126 leads | 18,43 | |
| · Venta - IG | 129.467 | 6.073 visitas · 3 leads | 21,32 | |
| Campaña de reconocimiento | 176.082 | 42.762 ThruPlay | 4,12 | 2,21 |
| Vendedores - Tasación - Formulario | 72.326 | 5 formularios | 14.465 | 1,86 |

Metas a 14 días: WhatsApp frecuencia < 3 y costo/conversación < ARS 500; PH 1 costo/formulario ≤ ARS 1.250; Vendedores WhatsApp (si corre) costo/conversación < ARS 3.000.
Valores de mercado usados en el brief (VALORES_REFERENCIA_ZONAS, Lanús Este, 10-2026): depto USD 1.711/m²; PH USD 725/m² y casa USD 671/m² sobre superficie total; alquiler 2 amb $550.000.

## 6. Pendientes de Gonzalo / equipo

**Hoy (menos de una hora)**
1. Mensaje de bienvenida en la app de WhatsApp Business (ventas) con el texto de tasación; respuesta rápida `/tasacion`.
2. Etiqueta "Meta Vendedores" en la app para los chats con recuadro "Mensaje de anuncio".
3. Mandar el brief a la CM; pedir primero la pieza A1 departamento 9:16.
4. Encabezados "Campaña" en I1 y "Anuncio" en J1 de la pestaña Leads Meta (planilla Carames_Leads_DM).
5. Descartar el borrador sobre DEPTO 1 - FORMULARIO en Ads Manager.

**Esta semana**
6. Duplicar el formulario de compradores con dos preguntas de opción múltiple y tipo "Mayor intención":
   - "¿Comprás con crédito hipotecario?": Sí, ya tengo preaprobado / Sí, estoy averiguando / No, pago contado.
   - "¿Cuándo pensás mudarte?": En los próximos 3 meses / Entre 3 y 6 meses / Todavía estoy mirando.
   Pasar el nombre del formulario para crear los anuncios nuevos.
7. Regla de agenda: celular del cliente en título o descripción de cada visita/tasación.
8. Definir quién carga a mano los chats de Vendedores en Leads Captación (diario) hasta que esté la API.
9. Instagram Insights: seguidores que trajo Venta - IG en octubre; decidir si sigue o pasa a Alquileres.

**Cuando lleguen piezas**
10. Pieza A1 → publicar Vendedores.
11. Semana 2: tres PH de reemplazo para Sarmiento 1524 y carrusel aptas crédito.
12. Avisar el mismo día cuando una propiedad se reserve o venda.

**Cuando esté el sistema nuevo**
13. Pegar en 360dialog la URL del webhook y mandar un WhatsApp de prueba.
14. Decidir migración del número con coexistencia para no perder la app.

**Pendientes previos**
15. Contactar los leads "Sin contestar" con propiedad para vender (análisis de agosto).
16. Terminar o dar de baja el escenario `5795614`.

## 7. Pendientes de Claude (al recibir lo de arriba)

- Con la pieza A1: crear creativo y anuncio en `120250447392610378`, publicar campaña + conjunto + anuncio, confirmar entrega.
- Con el formulario nuevo: crear anuncios de Formulario apuntando al formulario con preguntas y pausar los viejos.
- Con el primer lead: verificar en una ejecución de `5541462` que `campana`/`anuncio` lleguen con datos.
- 12/11 10:00 (tarea programada `trig_01X66twxEHMDoAp4GceL432Y`): relectura de la cuenta contra la línea de base, verificación de Make y de `_WA_EVENTOS`, resumen con 3 acciones. Sin cambios en la cuenta sin confirmación.
- Si se decide: pasar DEPTO 1 y el resto a un marcador no es posible (17 km mínimo); la alternativa es mejorar calidad con preguntas de calificación.
