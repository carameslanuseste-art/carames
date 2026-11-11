# Velocidad de caramespropiedades.com.ar en celular

Medición del 11/11/2026 con Lighthouse (la herramienta de la prueba de velocidad de Google), emulando un celular. Dos corridas sobre la portada.

## Qué se midió

| Métrica | Corrida 1 | Corrida 2 | Mail de ProsperaIA |
|---|---|---|---|
| Puntaje móvil | 33 / 100 | 43 / 100 | 34 / 100 |
| Contenido principal visible (LCP) | 13,3 s | 8,8 s | 22 s |
| Primer contenido visible (FCP) | 3,9 s | 2,2 s | - |
| Bloqueo total del hilo (TBT) | 1.290 ms | 880 ms | - |
| Peso total | 5,7 MB | 5,7 MB | 5,6 MB |

Conclusión: el mail es correcto. El sitio es lento en celular.

## De dónde sale el peso (5,7 MB, 118 pedidos)

| Tipo | Pedidos | Peso |
|---|---|---|
| Imágenes | 31 | 3,1 MB |
| JavaScript | 41 | 1,9 MB |
| Fuentes | 8 | 0,3 MB |
| CSS | 5 | 0,2 MB |

Archivos más pesados:

- Fotos de propiedades servidas desde `cdn-images.xintelweb.com` (17 fotos, 2,7 MB). Son JPEG de 800 a 1440 px, sin WebP.
- `general.js` del sitio: 365 KB. `index.css`: 196 KB (190 KB no se usan en la portada).
- Google Tag Manager más dos propiedades de Google Analytics: 524 KB en total.
- Google Maps embebido en la portada: unos 430 KB en scripts.
- Píxel de TikTok: 153 KB. Píxel de Meta más el constructor de parámetros de CAPI: 169 KB.

## Quién puede tocar qué

El sitio está construido sobre la plataforma Xintel (`xintelapi.com.ar`). El HTML, el CSS, el JavaScript principal, el mapa y las fotos los sirve Xintel. Un proveedor externo no puede modificar eso sin acceso a la plataforma.

Lo único que está en manos de Caramés sin tocar la página es el contenedor de Google Tag Manager (GTM-MD3FRGK) y las fotos que se suben al sistema.

## Prueba: qué pasa si se limpia GTM

Se corrió Lighthouse bloqueando GTM, Analytics, TikTok y Meta para simular el mejor caso de una limpieza de etiquetas.

| Métrica | Hoy | Sin etiquetas de seguimiento |
|---|---|---|
| Puntaje | 33 a 43 | 40 |
| LCP | 8,8 a 13,3 s | 7,0 s |
| Peso | 5,7 MB | 4,7 MB |

La limpieza de GTM ahorra alrededor de 1 MB y 1 a 2 segundos. Vale la pena, pero no alcanza: el grueso del problema está en la plataforma Xintel.

## Prueba: qué pasa si se recomprimen las fotos

Se descargaron las 17 fotos de la portada y se recomprimieron sin cambiar su tamaño en píxeles.

| Variante | Peso total | Ahorro |
|---|---|---|
| Original | 2.748 KB | - |
| JPEG calidad 80 | 2.637 KB | 5 % |
| WebP calidad 80 | 2.053 KB | 26 % |
| WebP a 800 px de ancho | 1.128 KB | 59 % |

Las fotos ya están razonablemente comprimidas como JPEG. Resubirlas más livianas casi no cambia nada. El ahorro real está en servirlas en WebP y en un tamaño acorde a la tarjeta donde se muestran, y eso lo tiene que hacer Xintel.

## Checklist para GTM (se hace en tagmanager.google.com, sin tocar el sitio)

El contenedor GTM-MD3FRGK carga hoy:

- 2 etiquetas de configuración de Google Analytics 4, con dos propiedades distintas: `G-5MNFVD48RQ` y `G-4253273990`. Esto duplica la carga (350 KB) y probablemente duplica las visitas en los informes. Hay que confirmar en Google Analytics cuál es la propiedad que se usa y pausar la otra.
- 15 etiquetas de eventos de GA4.
- 4 etiquetas de conversión de Google Ads.
- 5 etiquetas de HTML personalizado. Revisar una por una: una de ellas carga el constructor de parámetros de CAPI de Meta desde un bucket de Amazon.
- 1 etiqueta pausada (se puede borrar).
- Píxel de Meta (ID 1493868785198491).
- Píxel de TikTok. Además está cargado directo en el HTML del sitio, así que puede estar dos veces. Si no se hacen campañas en TikTok, pedir a Xintel que lo saque y quitarlo de GTM.

Pasos:

1. En Google Analytics, confirmar qué propiedad es la real. Pausar la etiqueta de la otra en GTM.
2. Revisar las 5 etiquetas de HTML personalizado y borrar las que no se usen.
3. Borrar la etiqueta pausada.
4. Decidir si el píxel de TikTok sigue. Si no, pausarlo.
5. Cambiar el disparador de las etiquetas que no son críticas (TikTok, Meta, HTML personalizado) de "Inicialización" o "Todas las páginas" a "Ventana cargada" (Window Loaded). Siguen midiendo igual pero no frenan la carga visible.
6. Publicar el contenedor y volver a medir en pagespeed.web.dev.

## Pedido a Xintel (borrador de mail)

Asunto: Mejora de velocidad en celular de caramespropiedades.com.ar

Hola, equipo de Xintel.

Medimos nuestro sitio con la prueba de velocidad de Google en celular y da entre 33 y 43 puntos sobre 100, con el contenido principal visible a los 9 a 13 segundos. La página pesa 5,7 MB. Según el detalle, lo que más pesa está del lado de la plataforma:

- Las fotos de propiedades se sirven desde cdn-images.xintelweb.com en JPEG de hasta 1440 px (2,7 MB en la portada). Servirlas en WebP y en el tamaño de la tarjeta bajaría ese peso más de la mitad.
- general.js pesa 365 KB e index.css 196 KB, de los cuales 190 KB no se usan en la portada.
- Google Maps se carga completo en la portada (unos 430 KB de scripts) aunque el mapa no está a la vista al entrar.
- El píxel de TikTok está incrustado en el HTML del sitio.

Queremos saber:

1. ¿Tienen opción de servir imágenes en WebP o con tamaños adaptados por dispositivo?
2. ¿Se puede diferir la carga de Google Maps hasta que el usuario llegue a esa sección?
3. ¿Pueden quitar el píxel de TikTok del HTML? Lo manejamos desde Google Tag Manager.
4. ¿Hay un plan o configuración de rendimiento disponible para nuestra cuenta?

Gracias.

## Respuesta sugerida a ProsperaIA

Hola, Tomás. Gracias por el aviso, verificamos la medición y coincide. El sitio está sobre la plataforma Xintel, que sirve el código y las fotos. Antes de avanzar nos interesa saber: ¿qué cambios concretos podrías aplicar en un sitio Xintel sin acceso a la plataforma, y a qué puntaje te comprometés a llegar? Con eso evaluamos.
