# Plan «cliente indicado» — decidido el 12/11/2026, se aplica en la revisión del viernes 20/11

Regla de criterio (Gonzalo, 12/11): **Compradores (Formulario y WhatsApp) y Vendedores se juzgan por cliente indicado** (compradores que visitan, propietarios que piden tasación y dan dirección), no por costo por resultado. **Seguidores IG y Reconocimiento se juzgan por costo** (costo por visita al perfil, costo por ThruPlay, alcance).

Nada de esto se aplica hasta el 20/11. Ese día se revisa la cuenta, se confirma la lista y se ejecuta.

## Acciones que aplico yo el 20/11 (con el ok de Gonzalo en esa revisión)

### 1. Señal de calidad a Meta desde la planilla (Make, campaña Formulario)
- Hoy Meta solo ve «formulario enviado». No distingue curioso de comprador.
- Qué se hace: en Make, cuando la columna Estado de «Leads Meta» pasa a «Visita agendada» o «Tasación», mandar a Meta un evento de lead calificado por la API de conversiones usando el `lead_id` que Meta ya entrega con cada lead. Después, cambiar la optimización de la campaña Formulario a «Clientes potenciales de conversión».
- Qué se espera: en 3 o 4 semanas, menos formularios y más visitas por formulario. El costo por formulario va a subir al principio y está bien.
- Condición: la columna Estado tiene que completarse todos los días. Sin eso no hay señal.
- Detalle técnico: dataset `1493868785198491`; evento CRM con `lead_id`, `event_name` «Lead» con etapa en `custom_data.lead_event_source`/`event_source: crm`; requiere conectar el CRM (Make) en Administrador de eventos → «Integraciones de CRM». Verificar el 20/11 qué permite la cuenta.

### 2. Aviso inmediato de cada lead al celular (Make, escenario 5541462)
- Agregar un paso que mande mail o notificación con nombre, teléfono, qué busca, presupuesto y si tiene propiedad para vender. Los que tienen propiedad para vender o presupuesto alto, marcados primero.
- Compromiso de Gonzalo: responder en menos de 15 minutos en horario de oficina. Definir a quién le llega.

### 3. Reporte semanal de visitas por anuncio (Make, escenario 5464268)
- Contar por campaña y anuncio (columnas K y L de «Leads Meta»): leads, contactados, visitas, tasaciones. Agregarlo al mail de los lunes.
- Sirve para decidir qué anuncio apagar o reforzar por visitas, no por costo.
- Condición: columna Estado completa.
- Al tocar el escenario, agregar al prompt de Claude la distinción por campaña (compradores/vendedores por cliente; IG/reconocimiento por costo).

### 4. Guido sin tope y DEPTO 1 pausado (Meta)
- «Ficha con tope - FORMULARIO» (`120250878340530378`): subir el tope de 2.000 a 5.000/día, o volver Guido 1419 a CASA 1 (prender `120248451520370378`, pausar el conjunto con tope).
- Pausar DEPTO 1 - FORMULARIO (`120248404521270378`) y DEPTO 1 - WPP (`120250280302610378`): no hay departamentos que mostrar. Se reactivan cuando entre stock con fotos.

### 5. Ubicaciones de compradores por intención (Meta)
- En todos los conjuntos de Formulario y WhatsApp: ubicaciones manuales = feed de Facebook, Marketplace, búsqueda de Facebook, reels de Facebook, reels de Instagram, feed de Instagram. Sacar stories de Instagram y de Facebook.
- Motivo: en Marketplace y búsqueda la persona está buscando propiedad; en stories pasa el rato.
- Reinicia el aprendizaje (ya reiniciado desde el 6/11).

### 6. Mensaje de bienvenida con botones en WhatsApp de compradores (Meta)
- En los anuncios de la campaña WPP: mensaje de bienvenida con botones «Busco para vivir» / «Busco para invertir», y luego «¿Qué presupuesto manejás?» con tres rangos (hasta USD 50.000 / 50.000 a 100.000 / más de 100.000).
- Dos preguntas, no más.

### 7. Vendedores - WhatsApp (Meta), cuando llegue la pieza A1
- Reemplazar el mensaje de bienvenida por defecto del anuncio en borrador por: «Hola, gracias por escribir a Caramés. Para la tasación sin cargo decinos la dirección y si es casa, PH o departamento. Te respondemos en el día.» Botones: «Quiero tasar mi propiedad» / «Quiero vender».
- Publicar conjunto y anuncio, activar la campaña (5.000/día). Medir por direcciones recibidas y visitas de tasación.

## Lo que hace Gonzalo antes o durante el 20/11
- **Formulario de compradores en modo «Mayor intención»** con dos preguntas: «¿Cuándo pensás comprar?» (próximos 3 meses / 3 a 6 meses / más adelante) y «¿Tenés crédito hipotecario?» (aprobado / en trámite / no). Administrador → Formularios instantáneos → duplicar → tipo Mayor intención → agregar preguntas → guardar → reemplazar en los anuncios. Pasar el nombre del formulario nuevo para conectarlo en Make.
- **Columna Estado de «Leads Meta» completa todos los días** (Contactado / Sin contestar / Visita agendada / Tasación / Fuera de zona / No interesa). Es la condición de las acciones 1 y 3.
- **Quien atiende WhatsApp anota en la planilla** si el chat pidió visita.
- Encabezados K1 «Campaña» y L1 «Anuncio».
- Píxel: públicos del sitio web siguen con menos de 1.000 personas; lo arregla quien maneja la web. Hasta entonces, no más retargeting web.
- Material para el brief de vendedores: lista de propiedades vendidas con autorización, datos de tiempo de venta, lista de documentos, cliente para testimonio, datos semanales para la story.
- Descartar borradores viejos en «Revisar y publicar».

## Seguidores IG y Reconocimiento (criterio costo), para el 20/11
- Seguidores IG: Alquileres a 15,94 por visita se mantiene; Venta a 19,77 se pausa si pasa de 20 dos semanas seguidas. Rotar reels cada 15 días. Contenido MIO con mínimo diario de 1.000 o pausado.
- Reconocimiento: se mantiene mientras el ThruPlay siga entre 2,5 y 4; se cambia el video cuando el costo suba o la interacción quede en el 10% inferior («Verdadero o Falso» hoy). Presupuesto 5.000/día se deja; solo baja si esos 1.900 hacen falta en compradores.

## Hecho el 12/11 (no requiere nada)
- Reporte de los lunes corregido: costo por conversación y por formulario con el gasto de cada campaña; costo por resultado en cada línea; regla «clientes reales» en el análisis.
- Brief de contenido solo para vendedores entregado (`Brief creativos - Vendedores - Meta Ads.docx`).
- Revisión programada: viernes 20/11 a las 10:00.
