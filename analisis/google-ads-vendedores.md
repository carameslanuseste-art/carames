# Google Ads — análisis de la campaña de captación de vendedores

**Caramés Bienes Raíces, Lanús Este** · cuenta Google Ads `488-225-5795` · análisis del 29/10/2026
Objetivo del negocio: captar propietarios que quieran vender en Lanús, Avellaneda y Lomas de Zamora.

> **Solo lectura.** No se modificó ninguna campaña, palabra clave, puja, presupuesto ni anuncio.
> Lo único que se tocó fue el escenario temporal de Make «TEMP Claude - Analisis Google Ads (borrar)»
> (id 6402180), que se usó para extraer los datos. Se puede borrar.

---

## Veredicto en una página

La cuenta tiene **una sola campaña activa**: «Caramés - Tasaciones / Vendedores» (Búsqueda, id
23969840286). En los últimos 90 días (31/07 al 28/10) gastó **$3.162.460** y registró 112,7
conversiones (**$28.068 por conversión**). Cruzando por teléfono los 60 leads de Google que están
en la planilla con la agenda de tasaciones, **5 leads terminaron en tasación** (4 realizadas, 1
agendada). Es un piso, no un techo, pero da un orden de magnitud de **~$630.000 por tasación**.

Los tres problemas que explican ese costo, en orden de impacto:

1. **AI Max está comprando búsquedas de otras inmobiliarias y de catastro, no de vendedores.**
   En la muestra de términos de búsqueda (los 400 más caros de 90 días, $1,12 M), el 86 % del
   gasto vino de coincidencias «AI_MAX». El 57 % de esa muestra ($644 k) fueron búsquedas de
   marcas de otras inmobiliarias («inmobiliaria banfield», «cabrera inmobiliaria», «pagano
   propiedades», «century 21 lanús»...). Las búsquedas con intención real de vender o tasar
   («quiero vender mi casa», «tasar propiedad») fueron solo el 14 % ($156 k).
2. **La estrategia de puja tiene un tope de CPC de $1.500 que frena justo las búsquedas buenas.**
   La campaña figura como «LIMITED», gasta $29.600/día de un presupuesto de $45.000, y pierde el
   41 % de las impresiones por ranking (0 % por presupuesto). Cuota de impresiones en la parte
   superior: 26–34 %. Las palabras de vendedor son las más competidas y las que más sufren el tope.
3. **Los anuncios y la landing hablan solo de Lanús, pero el 24 % del gasto va a Lomas de Zamora
   y Avellaneda.** Esos dos partidos tienen el peor costo por conversión ($40.900 y $40.200 contra
   $19.900–$30.700 en las localidades de Lanús). 4 de las 5 tasaciones atribuidas son de Lanús.
   Todos los titulares con zona dicen «Lanús» («Tasación Gratis en Lanús», «Inmobiliaria en
   Lanús», «Asesores que conocen Lanús», «Dos sucursales en Lanús»). Google califica la
   experiencia de la página de destino como **inferior al promedio en todas las palabras clave**.

Y un problema operativo que no es de Google Ads pero anula la campaña:

4. **Los leads no se están registrando ni siguiendo.** En octubre Google cuenta 14 formularios web
   «Solicitud de tasación», 10 formularios de Google y 2 llamadas, pero la planilla
   `Carames_Leads_DM` solo tiene los 10 formularios de Google: **desde el 1/10 no entró ningún
   lead del formulario web a la planilla** (en septiembre sí entraban, 19). Además, los 29 leads
   desde el 2/09 figuran «Sin contestar» y sin fecha de contacto, aunque dos de ellos terminaron
   en tasación: el estado no se mantiene. La columna «Se concretó» está vacía en las 60 filas y el
   GCLID (columna «Código clic Google») está guardado en todas, lo que permite importar tasaciones
   como conversiones offline y no se está usando.

---

## 1. Qué hay en la cuenta

| | |
|---|---|
| Campaña activa | «Caramés - Tasaciones / Vendedores», Búsqueda, 1 grupo de anuncios, 2 anuncios adaptables |
| Presupuesto | $45.000 / día |
| Puja | Cartera «Caramés - CPA 30k»: CPA objetivo **$35.000**, **tope de CPC $1.500** |
| AI Max | **Activado** |
| Redes | Solo Búsqueda de Google (sin socios ni Display). Correcto. |
| Ubicaciones | Partido de Lanús, Avellaneda, Lomas de Zamora. Criterio «presencia» (no interés). Correcto. |
| Idioma | Español |
| Negativas | 293 a nivel campaña + lista compartida «Negativas - Competencia y fuera de zona» (102) |
| Estado | Habilitada, sirviendo, **«LIMITED»** |
| Formulario de Google | «Tasá con nosotros», intención alta desde el 22/10, con preguntas de calificación |
| Otras campañas | 7 campañas inteligentes / de búsqueda viejas en pausa o sin tráfico. «Búsqueda - Vendedores y Compradores» (abril–junio) y «Máximo Rendimiento - Antiguo» ya no gastan. |

Seguimiento de conversiones: gestionado en la cuenta. Conversiones primarias hoy: Solicitud de
tasación (web), Lead form - Submit (Google), Clic WhatsApp, Llamadas desde anuncios, Calls from ads
y «Captación concretada» (importación offline, nunca usada). «Ficha de Propiedad Visitada» fue
primaria hasta julio: por eso julio muestra 2.439 «conversiones» a $297. Desde agosto es
secundaria. Bien hecho, pero el CPA objetivo aprendió primero sobre vistas de página.

## 2. Evolución mensual (campaña de vendedores)

| Mes | Gasto | Clics | CTR | CPC | Conv. | CPA | Cuota impr. | Perdida por ranking | Perdida por presupuesto |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jun | $17.894 | 280 | 10,7 % | $64 | 2 leads* | — | 26 % | 72 % | 2 % |
| Jul | $725.161 | 3.719 | 7,1 % | $195 | 44 leads* | $16.400 | 34 % | 55 % | 12 % |
| Ago | $1.184.555 | 2.744 | 3,8 % | $432 | 53,2 | $22.279 | 42 % | 42 % | 16 % |
| Sep | $1.128.584 | 1.732 | 3,6 % | $652 | 31,5 | $35.826 | 48 % | 36 % | 16 % |
| Oct (al 28) | $828.451 | 1.297 | 2,7 % | $639 | 26,0 | $31.868 | 59 % | 41 % | 0 % |

\* junio y julio recalculados contando solo formularios, WhatsApp y llamadas (las «conversiones»
oficiales de esos meses eran vistas de ficha).

Lectura: el CPC se triplicó entre julio y septiembre ($195 → $652) mientras los clics cayeron a
la mitad. El CTR bajó de 7,1 % a 2,7 %: los anuncios se muestran cada vez más en búsquedas que no
son de vendedores. La cuota de impresiones sube (59 %) porque la campaña gana subastas baratas,
no las caras.

Desglose de las conversiones primarias por mes:

| Mes | Solicitud de tasación (web) | Lead form Google | Clic WhatsApp | Llamadas |
|---|---:|---:|---:|---:|
| Ago | 25 | 6 | 16 | 6 |
| Sep | 16 | 2 | 13,5 | 0 |
| Oct | 14 | 10 | 0 | 2 |

En octubre «Clic WhatsApp» pasó de 13,5 a 0 como primaria (5 como secundaria). Vale revisar si se
cambió la acción o si el botón de WhatsApp dejó de medirse.

## 3. Términos de búsqueda: a quién le está mostrando anuncios Google

Muestra: los 400 términos más caros de los últimos 90 días (28 % del gasto). Clasificados a mano:

| Categoría | Gasto | % | Clics | Conv. | CPA |
|---|---:|---:|---:|---:|---:|
| Nombres de otras inmobiliarias y búsquedas genéricas «inmobiliaria» | $643.574 | 57 % | 1.151 | 21,5 | $29.900 |
| Otro (catastro, hipotecas, «vivienda en argentina», portales) | $192.318 | 17 % | 256 | 4,0 | $48.100 |
| **Intención de vender o tasar** | **$156.000** | **14 %** | 67 | 3,0 | $52.000 |
| Compradores / alquiler («casas en venta lanús») | $72.481 | 6 % | 143 | 1,3 | $54.400 |
| Catastro / legal / fiscal | $58.442 | 5 % | 52 | 5,0 | $11.700 |

Por tipo de coincidencia: AI Max $965 k (86 %), frase/exacta ampliada $157 k.

Octubre (250 términos más caros, $351 k): mismo patrón. 46 % otras inmobiliarias, 15 % catastro.
Los 12 términos que convirtieron en octubre: «catastro virtual» (3), «catastro», «www catastro
online», «informe catastral online», «inmobiliaria banfield», «caamaño propiedades», «tasador de
casas online», «casa para vender», «terrenos ministro rivadavia», «casas en banfield venta».

Qué significa:

- La palabra clave que más gastó en 90 días fue **«inmobiliaria para vender» en frase: $558.205 y
  23,8 conversiones**. Esa palabra es la puerta por la que entraron todas las búsquedas de marcas
  ajenas. El 19/10 se eliminó y se agregaron negativas exactas («inmobiliaria», «inmobiliarias»,
  «propiedades», «casas»). Bien. Pero las negativas son **exactas**, así que «inmobiliaria
  banfield» o «inmobiliaria peyras lanús» siguen entrando por AI Max: en los 9 días siguientes
  hubo 20+ términos de ese tipo.
- **Catastro** convierte en formularios (gente que quiere saber cuánto vale o qué datos tiene su
  inmueble, a veces por sucesión), pero son conversiones baratas de calidad dudosa. Ninguna de las
  5 tasaciones atribuidas vino de ahí.
- Las palabras «piso» (español de España: «quiero vender mi piso», «tasar piso online»,
  «valoración piso», «tasar piso») gastaron ~$170.000 por 2–3 conversiones. Nadie en Lanús vende
  «un piso».
- Las palabras con «online» («tasación online gratuita» es también un titular del anuncio) atraen
  gente que quiere un número sin visita: «tasador de casas online», «calcular precio vivienda
  online gratis», «simulador tasación gratuita». $100 k, 5 conversiones, cero tasaciones.

Palabras clave que sí funcionan (90 días, CPA por conversión):

| Palabra | Gasto | Conv. | CPA | Nivel de calidad |
|---|---:|---:|---:|---|
| quiero vender mi casa | $48.715 | 5 | $9.743 | 1 (página de destino inferior) |
| cuánto sale tasar una casa | $6.626 | 2 | $3.313 | 3 |
| tasar propiedad | $174.689 | 9,5 | $18.388 | 4 |
| poner en venta mi casa | $126.310 | 7 | $18.044 | — |
| tasación de propiedades | $363.923 | 17,2 | $21.100 | 5 |
| tasación vivienda | $32.845 | 2 | $16.400 | 4 |

Palabras a pausar o reescribir: «quiero vender mi piso» ($84.566, 1 conv.), «valuación de
propiedades» ($54.808, 1), «calcular precio vivienda online gratis» ($85.428, 4), «cuanto cuesta
mi casa» ($34.301, 0), «vender casa» ($23.652, 0), «quiero vender mi departamento» ($23.192, 0),
«tasación gratis» ($11.028, 0), «tasar casa online» ($5.570, 0), «simulador tasación gratuita».

## 4. Geografía

Gasto de 90 días por localidad de la persona (criterio «presencia»):

| Localidad | Gasto | % | Conv. | CPA |
|---|---:|---:|---:|---:|
| Lanús Oeste | $652.155 | 21 % | 21,2 | $30.690 |
| **Lomas de Zamora** | $572.056 | 18 % | 14,0 | **$40.861** |
| Lanús Este | $378.725 | 12 % | 17,5 | $21.641 |
| Gerli | $343.660 | 11 % | 13,0 | $26.435 |
| Remedios de Escalada | $332.214 | 11 % | 16,7 | $19.933 |
| Monte Chingolo | $301.792 | 10 % | 9,0 | $33.532 |
| **Avellaneda** | $201.035 | 6 % | 5,0 | **$40.207** |
| Valentín Alsina | $190.097 | 6 % | 6,0 | $31.683 |
| Lanús (centro) | $155.062 | 5 % | 8,2 | $18.795 |

Las 5 tasaciones atribuidas: Lanús Este (2), Lanús Oeste (1), Remedios de Escalada (1) y una sin
localidad. En la agenda de tasaciones de todo 2026 (104 registros, todos los canales) hay 1 en
Banfield, 1 en Burzaco y 2 en Avellaneda: el negocio hoy casi no tasa fuera de Lanús. Si la
expansión a Lomas y Avellaneda es una decisión, la campaña tiene que hablarles a ellos; si no lo
es, conviene concentrar el presupuesto en Lanús.

De los 60 leads de la planilla, 8 están marcados «Fuera de zona» (Glew, Temperley, Recoleta,
Adrogué, CABA, Almirante Brown...). Temperley y Banfield **están** en el partido de Lomas de
Zamora, que la campaña segmenta: si Temperley es «fuera de zona», hay que sacar Lomas de la
segmentación o cambiar la regla.

## 5. Dispositivo, día y hora

| Segmento | Gasto | Conv. | CPA |
|---|---:|---:|---:|
| Móvil | $2.999.595 | 110,7 | $27.105 |
| Escritorio | $150.860 | 2,0 | $75.430 |
| Tablet | $11.989 | 0 | — |
| Lunes | $576.728 | 26,0 | $22.183 |
| Jueves | $449.697 | 9,5 | $47.331 |
| Domingo | $419.175 | 10,0 | $41.912 |
| 0 a 7 h | $304.701 | 17,0 | $17.922 |
| 12 a 17 h | $1.308.355 | 37,5 | $34.888 |

Nada acá cambia el diagnóstico; escritorio merece un ajuste de puja negativo. Edad y género no
muestran diferencias útiles (CPA entre $21 k y $37 k en todas las franjas, con 65+ el más caro).

## 6. Anuncios, extensiones y página de destino

Dos anuncios adaptables en un solo grupo: uno «Bueno» ($2,55 M, 95 conv., CPA $26.746) y uno
«Promedio» ($617 k, 17,5 conv., CPA $35.265).

Problemas concretos en los titulares:

- «Realadvisor tasacion»: nombre de un competidor como titular (hoy deshabilitado, pero acumuló
  373 clics).
- «Tasación online gratuita» (48.251 impresiones, el tercer titular más mostrado) promete algo que
  el negocio no hace y trae las búsquedas «online» del punto 3.
- «Tasar departamento / piso», «Vendé rapido» (sin tilde), «Tasá Tu Propiedad Gratis En 24--48 H»
  duplicado de otro titular.
- Toda la zona es Lanús. No existe un titular, descripción ni sitelink que diga Lomas de Zamora,
  Banfield, Temperley o Avellaneda; solo una descripción los nombra.
- Titulares buenos que conviene fijar: «Cuanto vale mi casa» (24,6 conv.), «Saber valor de mi casa
  gratis» (28,5), «Inmobiliaria para vender» (37,1), «Vendé al mejor precio».

Extensiones: los sitelinks «Tasá tu propiedad gratis», «Formulario en 30 segundos» y «Quiero
vender» funcionan. «Ver propiedades» y «Propiedades en alquiler/venta» (ya eliminados) se llevaron
$2,1 M en 90 días mostrando catálogo a gente que buscaba vender. Quedan sitelinks automáticos
«Inmuebles en venta/alquiler» en pausa: mantenerlos en pausa.

Página de destino: `caramespropiedades.com.ar/tasacion` recibe el 71 % de los clics, pero aparece
como **cuatro URL distintas** (con y sin barra final, con y sin www), lo que fragmenta el
aprendizaje. Google califica la experiencia post-clic como «inferior al promedio» en **todas** las
palabras con nivel de calidad informado; la relevancia del anuncio también. Con niveles de
calidad 1 a 5, cada clic se paga más caro de lo que debería.

## 7. Lo que Google recomienda y no conviene aceptar

La cuenta tiene recomendaciones abiertas de activar Performance Max, socios de búsqueda y
expansión a Display. Las tres amplían el alcance hacia tráfico de menor intención; con el problema
de calidad actual, empeorarían el costo por tasación. La recomendación de «palabras clave nuevas»
hay que revisarla a mano (suele proponer términos de comprador).

## 8. Plan de mejoras, en orden

### Esta semana (sin rehacer la campaña)

1. **Desactivar AI Max** en la campaña. Es el origen del 86 % del gasto en términos no deseados.
   Quedarse con concordancia de frase y exacta en las palabras de vendedor.
2. **Negativas en concordancia de frase** (no exacta): `inmobiliaria`, `inmobiliarias`,
   `propiedades`, `bienes raíces`, `catastro`, `catastral`, `arba`, `dominio`, `titularidad`,
   `online`, `simulador`, `calculadora`, `piso`, `pisos`, `en venta`, `venta de`, `alquiler`,
   `hipoteca`, `crédito`, `curso`, `trabajo`. (Si se quiere probar catastro como fuente, hacerlo en
   un grupo aparte con anuncio propio, no mezclado.)
3. **Sacar el tope de CPC de $1.500** de la cartera «Caramés - CPA 30k» (o subirlo a $3.000) y
   dejar el CPA objetivo en $30.000–35.000. Hoy el tope impide pujar en las búsquedas de vendedor,
   que son las caras, y deja plata sin gastar.
4. **Pausar** las palabras del punto 3 (piso, online, valuación, cuanto cuesta mi casa, vender
   casa, quiero vender mi departamento).
5. **Deshabilitar titulares** «Tasación online gratuita», «Tasar departamento / piso» y el
   duplicado de 24--48 h; corregir «Vendé rápido».
6. **Ajuste de puja −40 % en escritorio.**
7. **Unificar la URL final** en `https://caramespropiedades.com.ar/tasacion/` en los dos anuncios
   y en los sitelinks.

### Próximas dos semanas (estructura)

8. **Un grupo de anuncios por partido**: Lanús, Lomas de Zamora, Avellaneda. Mismas palabras de
   vendedor en cada uno, con titulares fijados «Tasación gratis en Lomas de Zamora», «Vendé tu casa
   en Banfield o Temperley», «Inmobiliaria para vender en Avellaneda», y sitelinks «Tasá en Lomas»,
   «Tasá en Avellaneda» (hoy solo existen «Tasá en Lanús Este/Oeste»). Si se puede, una página de
   destino por partido (`/tasacion/lomas-de-zamora`) con la misma estructura que la de Lanús.
   Alternativa si no hay recursos: tres campañas, una por partido, con presupuesto propio; permite
   cortar Lomas o Avellaneda sin tocar Lanús.
9. **Agregar palabras exactas y de frase con zona**: `tasar casa lanús`, `tasación lanús oeste`,
   `vender casa lomas de zamora`, `inmobiliaria para vender mi casa en banfield`, `tasación
   avellaneda`, `cuánto vale mi casa en gerli`; y un grupo «sucesiones»: `tasación para sucesión`,
   `vender casa heredada`, `tasación judicial` (dos de los últimos leads del formulario vinieron por
   ese motivo).
10. **Página de destino**: formulario arriba del todo en móvil (95 % del tráfico), nombre de la
    zona en el título, una línea de prueba social («4,2 con 175 reseñas»), tiempo de respuesta y
    foto de la sucursal. Medir velocidad en móvil; hoy la experiencia es inferior al promedio en
    todas las palabras.

### De fondo (lo que más cambia el resultado)

11. **Importar «Tasación agendada» como conversión offline.** La planilla guarda el GCLID de cada
    lead. Un escenario de Make que, al agendarse una tasación, cruce el teléfono con «Leads Google»
    y suba el GCLID a la acción «Captación concretada» (o a una nueva «Tasación agendada») le da al
    CPA objetivo la señal correcta. Hoy optimiza hacia formularios, y un formulario de catastro
    vale lo mismo que uno de un vendedor real. Cuando haya 15+ al mes, hacerla la única primaria.
12. **Arreglar la entrada de leads del formulario web a la planilla** (desde el 1/10 no llega
    ninguno) y **reactivar el seguimiento**: los 29 leads desde el 2/09 están «Sin contestar» sin
    fecha de contacto. Un lead de vendedor que no se llama en 24 h se pierde.
13. **Cambiar el KPI del informe semanal**: tasaciones agendadas y captaciones por canal, no
    conversiones ni costo por conversión. Con los números de hoy, 112 conversiones «a $28.000»
    esconden 5 tasaciones a ~$630.000.

## 9. Qué esperar

Si se aplican los puntos 1 a 7, el gasto va a bajar durante una o dos semanas (menos tráfico de
marcas ajenas) y el CPC va a subir (se puja más en búsquedas de vendedor). La métrica que importa
es cuántas tasaciones agendadas vienen de Google por mes: hoy son ~2. Con el mismo presupuesto, un
objetivo razonable a 60 días es 6–8 por mes, y recién ahí tiene sentido pensar en subir
presupuesto o abrir Lomas y Avellaneda con páginas propias.

## Fuentes y método

- Google Ads vía escenario de Make 6402180 (módulo «Google Ads Reports – Run a custom report»,
  conexión 9490236), 90 días del 31/07 al 28/10/2026 y mensual desde enero; volcado a la planilla
  `16Q22AfSFdvRInU4p4CBsKD1Br2bojYtpQZR5loJD4m0` y exportado como CSV.
- Términos de búsqueda: 400 más caros de 90 días y 250 más caros de octubre; la clasificación por
  categoría es manual sobre esa muestra, no sobre el total.
- Leads: pestaña «Leads Google» de `Carames_Leads_DM`. Tasaciones: pestaña «_Mirror» (espejo de la
  agenda), 104 registros de 2026. Cruce por últimos 8 dígitos del teléfono.
- Cambios recientes: historial de cambios de la cuenta del 30/09 al 29/10 (negativas agregadas el
  8/10 y 19/10, palabra «inmobiliaria para vender» eliminada el 19/10, formulario de Google
  recreado el 19/10 y editado el 22/10, anuncios editados el 8/10).
- Los montos están en pesos argentinos; las conversiones fraccionarias son por atribución basada
  en datos.

---

## Registro de cambios aplicados el 29/10/2026

Aplicados vía la API de Google Ads (módulo «Google Ads Campaign Management» de Make, conexión
«Caramés - Google Ads (lectura)», que en realidad tiene permiso de escritura). Todo es reversible
desde la cuenta.

### Estructura nueva

| Campaña | ID | Presupuesto | Ubicación | Grupos |
|---|---|---:|---|---|
| Caramés - Vendedores - Lanús | 24417907615 | $28.000/día | Partido de Lanús (presencia) | Vendedores - Lanús (40 palabras, 2 anuncios), Sucesiones y herencias (10 palabras, 1 anuncio) |
| Caramés - Vendedores - Lomas de Zamora | 24412071329 | $10.000/día | Lomas de Zamora (presencia) | Vendedores - Lomas de Zamora (28 palabras, 1 anuncio) |
| Caramés - Vendedores - Avellaneda | 24412071332 | $7.000/día | Avellaneda (presencia) | Vendedores - Avellaneda (28 palabras, 1 anuncio) |
| Caramés - Tasaciones / Vendedores (AI Max, pausada 29/10) | 23969840286 | $28.000/día | — | **Pausada.** La API no permite apagar AI Max en una campaña que ya lo tiene activado, así que se reemplazó por la campaña nueva de Lanús. Se puede reactivar si hiciera falta. |

Las tres campañas nuevas: solo Red de Búsqueda (sin socios ni Display), AI Max apagado, idioma
español, escritorio con ajuste de puja −40 %, estrategia de cartera «Caramés - CPA 30k» compartida
(CPA objetivo $35.000, **tope de CPC subido de $1.500 a $3.000**). Presupuesto total igual al
anterior: $45.000/día.

### Palabras clave

- Todas en concordancia de frase. Base común de 18 palabras de vendedor («quiero vender mi casa»,
  «tasar propiedad», «tasación de propiedades», «poner en venta mi casa», «cuánto vale mi casa»…)
  más 10 con zona por campaña («vender casa banfield», «tasación avellaneda», «tasación lanús
  oeste»…) y un grupo «Sucesiones y herencias» en Lanús.
- En la campaña vieja se pausaron antes de pausarla: «quiero vender mi piso», «valuación de
  propiedades», «calcular precio vivienda online gratis», «cuanto cuesta mi casa», «vender casa»,
  «quiero vender mi departamento», «tasación gratis», «tasar casa online», «simulador tasación
  gratuita», «cuanto vale mi piso», «tasacion online gratuita», «tasación vivienda online gratis»,
  «…con referencia catastral», «tasador de viviendas», «inmobiliaria Lanús vender».

### Negativas

Lista compartida nueva **«Negativas - Vendedores (frase)»** (id 12294147640, 137 términos en
frase) vinculada a las tres campañas, junto con la lista existente «Negativas - Competencia y
fuera de zona». Bloquea: inmobiliaria(s), bienes raíces, catastro/catastral/arba/dominio/
titularidad/nomenclatura, valuación fiscal, impuesto, abl, gastos de escritura, online, simulador,
calculadora, piso(s), casas/casa/departamento(s)/ph/terreno(s) en venta, venta de casas/
departamentos/terrenos, dueño directo, comprar/compro/compra, alquiler(es)/alquilar/alquilo,
hipoteca/hipotecario/hipotecar, crédito, cuotas, curso, trabajo, empleo, sueldo, carrera,
martillero, portales (zonaprop, argenprop, mercadolibre, properati, idealista, mitula), franquicias
(remax, century) y ~60 nombres de inmobiliarias de la zona vistos en los términos de búsqueda.

### Anuncios

- Lanús: dos anuncios adaptables con los textos de los anteriores, sin «Tasación online gratuita»,
  sin «Tasar departamento / piso», sin «Tasador de propiedades»; con «Tasación gratis en Lanús»,
  «Tasá tu casa en Lanús», «Asesores que conocen Lanús», «Vendé rápido» corregido y una
  descripción que nombra Lanús Este y Oeste, Gerli, Escalada y Alsina.
- Lomas de Zamora: «Tasación gratis en Lomas», «Vendé tu casa en Banfield», «Tasamos en
  Temperley», «Asesores en Lomas de Zamora» + descripción propia.
- Avellaneda: «Tasación gratis en Avellaneda», «Vendé tu casa en Avellaneda», «Tasamos en Sarandí
  y Wilde», «Asesores en Avellaneda» + descripción propia.
- Sucesiones: «Tasación para sucesión», «Vendé una casa heredada», «Tasación judicial y
  sucesoria», «Te orientamos en los pasos».
- URL final unificada en `https://caramespropiedades.com.ar/tasacion/` con rutas visibles
  `/tasacion/lanus`, `/tasacion/lomas-zamora`, `/tasacion/avellaneda`, `/tasacion/sucesion`.
- Los anuncios de Lanús quedaron «en revisión» al cierre; los de Lomas y Avellaneda ya aprobados.

### Extensiones

Vinculadas a las tres campañas: formulario de Google «Tasá con nosotros», sitelinks «Quiero
vender», «Sobre Caramés», «Tasá tu propiedad gratis», «Formulario en 30 segundos», 9 textos
destacados, extensión de llamada, 4 imágenes y 2 fragmentos estructurados. Nuevos sitelinks
«Tasá en Lomas de Zamora» (Lomas) y «Tasá en Avellaneda» (Avellaneda); «Tasá en Lanús Este/Oeste»
en Lanús.

### Conversiones

- «Clic WhatsApp» pasó a **secundaria** (ya no entra en el CPA objetivo).
- Creada la acción **«Tasación agendada (offline)»** (id 7882251010, categoría cliente potencial
  calificado, importación por GCLID, ventana 90 días, primaria). La alimenta el escenario de Make
  descripto abajo.

### Recomendaciones de Google

Descartadas: Performance Max, socios de búsqueda y expansión a Display.

### Make

- `Carames - Tasacion Web -> Planilla` (id 5480977) estaba **desactivado desde fines de agosto**:
  por eso ningún lead del formulario web entró a la planilla en octubre. Hay que activarlo a mano
  (el asistente no tiene permiso para activar escenarios).
- Escenario nuevo «Caramés - Tasaciones agendadas -> Google Ads (conversión offline)»: una vez por
  día cruza los leads de «Leads Google» que tienen GCLID y no tienen «Se concretó» con la agenda de
  tasaciones (`_Mirror`) por los últimos 8 dígitos del teléfono; si hay tasación, sube la conversión
  a «Tasación agendada (offline)» con la fecha de la visita y marca la fila. Se crea desactivado:
  activarlo a mano.
- El escenario temporal «TEMP Claude - Analisis Google Ads (borrar)» (id 6402180) quedó como
  herramienta de consulta/escritura a la API; se puede borrar.

### Pendientes que no se pueden hacer desde acá

- Páginas de destino por zona en la web y mejora de la página `/tasacion` en móvil.
- Seguimiento humano: 29 leads desde el 2/09 sin fecha de contacto.
- Cambiar el KPI del informe semanal a tasaciones agendadas por canal (escenario 5922617).

### Actualización 29/10, 20:15 (después de activar los escenarios)

- El escenario de conversión offline (id 6831504) quedó corregido y probado: encuentra 4 leads de
  Google con tasación agendada (filas 14, 20, 28 y 46 de «Leads Google») y arma la subida bien.
  Google rechazó la primera subida con `TOO_RECENT_CONVERSION_ACTION` («la acción de conversión se
  creó hace menos de 6 horas»). La corrida diaria de las 10:15 del 30/10 las va a subir. Cada
  subida queda registrada en la planilla «Carames - Términos de búsqueda (Google Ads)» con la
  respuesta de Google.
- Al activar `Carames - Tasacion Web -> Planilla`, Make procesó la cola de webhooks retenidos: entraron
  **14 leads web de Google Ads** (12 personas distintas) fechados 29/10 y marcados «Sin contestar».
  Son pedidos de tasación reales de las últimas semanas que nunca llegaron a la planilla.
- Los 5 anuncios nuevos están aprobados. Fuerza del anuncio: Lanús «Bueno» (2), Avellaneda
  «Promedio», Lomas y Sucesiones «Deficiente» por los titulares fijados en posición 1; no afecta la
  entrega pero conviene revisar a los 15 días.


## Actualización 29/10, 20:40

**Negativas portadas.** Las 226 negativas útiles de la campaña vieja (competidores, zonas fuera
de cobertura, compradores, alquileres, créditos) se cargaron en la lista compartida «Negativas -
Vendedores (frase)» (ID 12294147640), que ya está aplicada a las tres campañas. Google respondió
200 sin errores parciales; la lista quedó con 350 términos. Se dejó afuera a propósito la negativa
«wilde»: Wilde es partido de Avellaneda y entra en la zona.

**Sufijo de URL por campaña.** Cada campaña agrega a la página de tasación un parámetro de zona:
Lanús `z=lanus`, Lomas de Zamora `z=lomas`, Avellaneda `z=avellaneda`. Hoy la página lo ignora;
con la versión nueva de `web/tasacion/index.html` el título cambia según la zona y el dato viaja
a Make como `zona_campania`.

**Página de tasación.** La versión mejorada está en `web/tasacion/` con su README (qué cambia y
cómo publicarla). Verificada en 390 px y 1200 px: título dinámico, barra fija en móvil, prueba
social junto al botón, plazo «24–48 h hábiles» consistente, zonas completas y dirección en el pie.

**Regla de zona (definición operativa).** Entra en zona todo lo que esté dentro de los partidos de
Lanús (Lanús Este y Oeste, Gerli, Remedios de Escalada, Valentín Alsina, Monte Chingolo), Lomas
de Zamora (Lomas centro, Banfield, Temperley, Turdera, Llavallol, Villa Fiorito, Ingeniero Budge,
San José) y Avellaneda (centro, Piñeyro, Gerli, Sarandí, Wilde, Villa Domínico, Dock Sud). Todo lo
demás es «Fuera de zona» y se marca así en «Leads Google» para que el informe lo descuente. La
campaña de Lomas ya tiene palabras clave propias de Banfield y Temperley (8 de 28) y segmenta por
presencia en el partido completo.

**Informe semanal de Make (escenario 5922617).** Está inactivo desde agosto; hoy el correo del
lunes no incluye Google Ads. Si se reactiva, conviene que reporte tasaciones agendadas por canal y
costo por tasación (cruzando «Leads Google» con la columna «Se concretó» / la subida offline) en
vez de «conversiones», que mezcla formularios con tasaciones.

**Página publicada (29/10, 21:05).** La versión nueva quedó en línea en
`public_html/tasacion/index.php` (Zetahosting, cPanel); el archivo anterior se conservó como
`index_anterior.php`. Verificado desde afuera: el archivo servido es idéntico al del repo,
`?z=lomas`, `?z=lanus` y `?z=avellaneda` cambian el título, la barra fija aparece en móvil, sin
errores de JavaScript, y siguen presentes los dos webhooks de Make, el píxel de Meta, la
etiqueta de conversión de Google Ads y la captura del GCLID.

**Zona de campaña en «Leads Google» (30/10, 21:15).** Columna nueva Z «Campaña Google Ads (zona)»
con valores Lanús / Lomas de Zamora / Avellaneda. La completan los dos escenarios que escriben en
esa pestaña: «Tasacion Web -> Planilla» (5480977) a partir del parámetro `zona_campania` que manda la
página (viene del sufijo de URL `z=` de cada campaña), y «Formulario Google Ads -> Planilla»
(6406919) a partir del `campaign_id` del formulario de Google (IDs de las tres campañas; una campaña
desconocida queda como «Campaña <id>»). El escenario web además ahora llena N «Tipo propiedad» y O
«Zona» con lo que eligió la persona en el formulario, que antes solo iban dentro del texto de D.
Probado con un envío real al webhook (fila de prueba verificada y borrada). Los leads anteriores al
30/10 no tienen zona de campaña; el correo de aviso del lead web ahora también dice la campaña.

## Actualización 30/10

**Primer día completo de las campañas nuevas.** Hasta las 11:00 del 30/10 las tres campañas sumaban
9 impresiones y 1 clic (la campaña vieja hacía 2.000 a 2.800 impresiones y 35 a 90 clics por día).
Estado «Aprendizaje de la estrategia de puja»; anuncios, palabras clave y extensiones aprobados.
Causa: la estrategia de CPA objetivo creada el 29/10 arranca sin historial y puja muy bajo.

**Cambio de puja (30/10, 15:10).** Las tres campañas pasaron de la cartera de CPA objetivo
(12251090708, $35.000 con tope de CPC $3.000) a **Maximizar conversiones sin objetivo**, a nivel
campaña. El gasto sigue limitado por los presupuestos diarios ($28.000 + $10.000 + $7.000). Volver
al CPA objetivo con tope cuando haya 30 conversiones acumuladas (estimado: 2 a 3 semanas). La
cartera 12251090708 queda creada sin campañas, lista para reutilizar.

**Conversiones offline.** La corrida de las 10:15 del 30/10 subió las 4 tasaciones agendadas
(Sabrina 13/08, Graciela Bacay 26/08, Graciela Fernández 2/09, Teresa 1/10) con respuesta 200 y
job IDs de Google. Aparecen en Google Ads en la fecha de cada tasación, no en la de subida.

**Informe semanal de Make (5922617) rehecho y reactivado.** Ahora se llama «Carames - Google Ads
semanal (tasaciones por zona y costo por tasacion)». Corre los lunes 09:25 y manda un correo a
carameslanuseste@gmail.com (además de escribir el bloque del correo del lunes en el datastore
125425) con: inversión de las tres campañas (últimos 7 días), leads de Google, tasaciones
agendadas con origen Google (7 y 28 días), costo por tasación, leads «Sin contestar», y el
desglose por zona (Lanús, Lomas de Zamora, Avellaneda, sin zona) usando la columna Z de «Leads
Google» y la columna J «Se concretó» que marca la subida offline. Compara contra la semana anterior
a partir de la segunda corrida.

## Revisión pendiente: 7 a 10 de noviembre de 2026

Checklist para la revisión de las tres campañas (pedir a Claude «hacé la revisión de Google Ads»):

1. **Entrega.** Impresiones y clics por día y por campaña desde el 30/10. Cuota de impresiones y
   cuánto se pierde por presupuesto y por ranking. Si Lanús ($28.000) agota el presupuesto antes de
   las 18 h, mover presupuesto desde la que menos convierta.
2. **Términos de búsqueda.** Listar todos los términos con clics; agregar negativas a la lista
   «Negativas - Vendedores (frase)» (12294147640): compradores, alquileres, créditos, zonas fuera de
   los tres partidos, nombres de otras inmobiliarias.
3. **Costo por tasación agendada por zona.** Cruzar inversión por campaña con la columna Z de «Leads
   Google» y las filas con J «Sí». Comparar con el informe semanal del lunes 2/11 y 9/11.
4. **Anuncios.** Los RSA de Lomas (829926940525) y Sucesiones (830013640997) figuran «Deficiente»
   por los titulares fijados; si siguen así, soltar los pines o agregar titulares. Revisar CTR por
   anuncio.
5. **Formulario de Google (lead form).** Cuántos leads entraron por formulario vs. por la web y qué
   porcentaje terminó en tasación agendada. Si el formulario trae leads de baja calidad, bajarlo a
   objetivo «más calificado».
6. **Puja.** Si hay 30 o más conversiones acumuladas, volver a CPA objetivo (cartera 12251090708,
   ajustar el objetivo al costo real por conversión observado). Si no, seguir con Maximizar
   conversiones una semana más.
7. **Regla de zona.** Contar leads «Fuera de zona» por campaña; si la campaña de Lomas sigue trayendo
   leads que se descartan, revisar palabras clave y radio de segmentación.
8. **Conversión primaria.** Cuando «Tasación agendada (offline)» tenga 15 o más por mes, dejarla como
   única conversión primaria y quitar «Solicitud de tasación» y «Lead form - Submit» de la puja.

## Actualización 30/10, 17:30 — tres mejoras más

**Llamadas solo en horario de atención.** La extensión de llamada (asset 389272335602, 011 4247-4336)
que usan las tres campañas nuevas ahora se muestra lunes a viernes de 9 a 18 y sábados de 9 a 13.
Fuera de ese horario el anuncio sale igual, con formulario y página, pero sin el botón de llamar.
Verificado leyendo el asset.

**Variante de sucesiones en la página.** `?z=sucesion` cambia el título a «Heredaste una propiedad:
tasala gratis y vendela sin vueltas», el subtítulo habla a herederos y se agregan 3 preguntas
frecuentes sobre sucesión (tasar antes de la declaratoria, documentación para vender, varios
herederos). El grupo «Sucesiones y herencias» (203183559322) tiene sufijo de URL `z=sucesion` a
nivel grupo, que pisa el `z=lanus` de la campaña. El escenario web de Make guarda esos leads con
zona «Lanús · Sucesiones», marca «SUCESIÓN / HERENCIA» en la columna D y el mail de aviso lleva
«[SUCESIÓN]» en el asunto. Publicada en el hosting el 30/10 a las 17:34 (respaldo
`index_anterior_2.php`); verificado desde afuera que el archivo servido es idéntico al del repo y que
las cinco variantes de la página responden sin errores.

**Retargeting en Meta.** Cuenta 934514726949339 (Caramés Bienes Raices - Sucursal Lanús Este).
Audiencia «Visitó /tasacion sin enviar (14 días)» (120250742840160378): píxel 1493868785198491, URL
contiene «tasacion» menos quienes dispararon el evento Lead, retención 14 días. Campaña «Vendedores -
Retargeting visitantes /tasacion» (120250742925900378), objetivo clientes potenciales, categoría
especial Vivienda, presupuesto $3.000/día a nivel campaña, puja al menor costo. Conjunto
120250742944390378: solo la audiencia personalizada (Advantage+ Audience apagado por ese motivo),
Argentina, optimizado a evento Lead del píxel, destino web. Anuncio 120250742962940378 con el
creativo 1168365599016946 (imagen `web/meta/retargeting-tasacion-1080x1080.jpg`, servida desde
GitHub; texto «¿Te quedaste con la duda de cuánto vale tu propiedad?…»; botón Más información;
destino `/tasacion/?z=meta`, que la planilla registra como «Meta (retargeting)»). Publicado el 30/10.
Quedó en el borrador de Ads Manager un anuncio fallido (120250742961170378, error de imagen
duplicada) que no se publicó; se puede descartar desde Ads Manager. La audiencia tarda unos días en
superar el mínimo de personas; hasta entonces el anuncio puede no entregar.

## Revisión de entrega — 31/10, 12:40

**Entrega por día (tres campañas nuevas):**

| Día | Lanús | Lomas de Zamora | Avellaneda | Total |
|---|---|---|---|---|
| 29/10 (desde las 20 h) | 1 impr. | 1 impr. | 3 impr. | 5 |
| 30/10 | 30 impr. · 2 clics · $1.518 | 8 impr. · 1 clic · $919 | 1 impr. | 39 |
| 31/10 (hasta las 12 h) | 23 impr. · 1 clic · $3.337 | 2 impr. | 2 impr. | 27 |

La campaña vieja hacía 2.000 a 2.800 impresiones por día. Cuota de impresiones de Lanús 67-81 %
(lo que pierde es por ranking, no por presupuesto): el problema no es la puja sino que las frases
en concordancia de frase casi no coinciden con búsquedas en los tres partidos. Términos de búsqueda
en tres días: 14, todos de 1 o 2 impresiones; aparecieron búsquedas de la costa («vendo urgente
departamento frente al mar», «santa teresita», «en la costa») por la concordancia de frase de
«vender mi casa rápido» y similares.

**Aplicado:**

1. **Concordancia amplia.** Se agregaron 14 palabras clave en concordancia amplia en cada uno de los
   tres grupos por zona (42 en total): tasar mi casa, tasar propiedad, tasación de propiedades,
   quiero vender mi casa, quiero vender mi propiedad, tasación de inmuebles, necesito vender mi
   casa, cuánto vale mi casa, cuánto vale mi propiedad, tasar casa, tasar departamento, tasación
   vivienda, vender mi casa, tasación inmobiliaria. Las de concordancia de frase siguen activas (la
   concordancia no se puede editar; conviven). La segmentación geográfica por presencia en los tres
   partidos y las 360 negativas siguen limitando a quién se le muestra. Es la combinación que Google
   recomienda con Maximizar conversiones. El grupo de sucesiones no se tocó.
2. **Negativas nuevas (10)** en «Negativas - Vendedores (frase)»: frente al mar, en la costa, santa
   teresita, san bernardo, villa gesell, pinamar, mar del plata, mar de ajo, costa atlantica, mis
   tasaciones.

**Criterio para la próxima verificación (lunes 3/11 con el informe semanal, o antes si se pide):**
las tres campañas juntas deberían superar las 300 impresiones diarias el domingo 2/11. Si no,
revisar la segmentación geográfica (pasar de «presencia» a «presencia o interés») y el estado de
aprendizaje.
