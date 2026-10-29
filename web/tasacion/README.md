# Página /tasacion — versión mejorada (29/10/2026)

`index.html` es la página https://caramespropiedades.com.ar/tasacion/ tal como estaba
publicada el 29/10/2026, con las mejoras de abajo. Para publicarla hay que reemplazar el
archivo de `/tasacion/index.html` en el hosting por este (misma ruta, mismas imágenes:
usa `/img/logo-carames.png` que ya existe en el sitio).

## Qué cambia

1. **Título y sello de zona según la campaña.** Google Ads ahora manda a cada visitante con
   `?z=lanus`, `?z=lomas` o `?z=avellaneda` (sufijo de URL de cada campaña). La página cambia
   el título a «Tasá tu propiedad gratis en Lomas de Zamora, Banfield y Temperley» (o la zona
   que corresponda). Sin parámetro muestra «en Lanús, Avellaneda y Lomas de Zamora».
2. **Móvil: el formulario queda más arriba.** Hero más compacto en pantallas de hasta 640 px.
3. **Barra fija inferior en móvil** con «Pedir tasación gratis» (vuelve al formulario) y
   «WhatsApp». Aparece solo cuando el formulario ya no está a la vista y desaparece después de
   enviar.
4. **Prueba social al lado del botón:** «★ 4,3 en Google · 179 reseñas · Gratis y sin compromiso».
5. **Plazo consistente:** «24–48 h hábiles» en el hero, los sellos y el texto.
6. **Zonas completas** en el beneficio «Conocemos la zona», en la pregunta frecuente «¿En qué
   zonas tasan?» y en los datos estructurados (incluye Banfield, Temperley, Sarandí, Villa
   Domínico, Gerli, Remedios de Escalada, Valentín Alsina y Monte Chingolo).
7. **Dirección en el pie:** Tucumán 1199, Lanús Este.
8. **El formulario manda `zona_campania`** al webhook de Make (valor de `?z=`), además de los
   campos de siempre. No rompe nada si Make no lo usa.

No se tocó: el webhook, el píxel de Meta, la etiqueta de conversión de Google Ads, la captura
del GCLID ni el flujo de WhatsApp.

## Cómo probar después de publicar

- Abrir `https://caramespropiedades.com.ar/tasacion/?z=lomas` desde el celular: el título debe
  decir «…en Lomas de Zamora, Banfield y Temperley».
- Bajar hasta las reseñas: debe aparecer la barra roja/verde abajo.
- Enviar un pedido de prueba: la barra desaparece y se abre WhatsApp como siempre.
