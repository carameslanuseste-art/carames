const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageNumber, HeightRule, VerticalAlign, PageBreak,
  LevelFormat
} = require("docx");
const fs = require("fs");

// A4 = 11906 x 16838 DXA. Margins 1440 -> content width 9026.
const W = 9026;
const INK = "141D26", INK2 = "43535F", INK3 = "6E7C89";
const ALERT = "AF3527", GO = "0E7A63", WARN = "B07C18", NEUTRAL = "43539E";
const RULE = "D9E1E8";

const NONE = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE };
const thin = { style: BorderStyle.SINGLE, size: 4, color: RULE };
const cellBorders = { top: thin, bottom: thin, left: thin, right: thin };

const run = (text, o = {}) => new TextRun({
  text, size: o.size ?? 20, color: o.color ?? INK2, bold: o.bold, italics: o.italics, font: o.font
});
const b = (text) => run(text, { bold: true, color: INK });
const mono = (text) => run(text, { font: "Consolas", color: INK, size: 18 });

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 276 },
  indent: opts.indent,
  alignment: opts.alignment,
  children: Array.isArray(text) ? text : [run(text, { size: opts.size ?? 20, color: opts.color ?? INK2, bold: opts.bold, italics: opts.italics })]
});

const bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bullets", level },
  spacing: { after: 70, line: 276 },
  children: Array.isArray(text) ? text : [run(text)]
});

const gap = (h = 200) => new Paragraph({ spacing: { after: h }, children: [] });

function h1(tag, title) {
  return [
    new Paragraph({
      spacing: { before: 460, after: 0 },
      children: [run(tag.toUpperCase(), { size: 15, bold: true, color: INK3, font: "Consolas" })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 60, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK } },
      children: [run(title, { size: 30, bold: true, color: INK })]
    })
  ];
}

function h2(title, sub) {
  const kids = [new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: sub ? 40 : 140 },
    children: [run(title, { size: 24, bold: true, color: INK })]
  })];
  if (sub) kids.push(new Paragraph({
    spacing: { after: 140 },
    children: [run(sub, { size: 17, color: INK3, font: "Consolas" })]
  }));
  return kids;
}

function note(kind, label, ...paras) {
  const color = { stop: ALERT, warn: WARN, ok: GO, info: NEUTRAL }[kind];
  const fill = { stop: "F9E9E6", warn: "FBF2E0", ok: "E4F1EC", info: "E7EAF7" }[kind];
  const kids = [];
  if (label) kids.push(new Paragraph({
    spacing: { after: 70, line: 276 },
    children: [run(label.toUpperCase(), { size: 15, bold: true, color, font: "Consolas" })]
  }));
  paras.forEach((t, i) => kids.push(new Paragraph({
    spacing: { after: i === paras.length - 1 ? 0 : 90, line: 276 },
    children: Array.isArray(t) ? t : [run(t)]
  })));
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    borders: {
      top: NONE, bottom: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE,
      left: { style: BorderStyle.SINGLE, size: 18, color }
    },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill, color: "auto" },
      margins: { top: 180, bottom: 180, left: 220, right: 220 },
      children: kids
    })] })]
  });
}

function table(headers, rows, widths) {
  const mk = (content, o = {}) => new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.head ? { type: ShadingType.CLEAR, fill: "EDF1F5", color: "auto" } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: cellBorders,
    verticalAlign: VerticalAlign.TOP,
    children: Array.isArray(content) ? content.map(c => new Paragraph({
      spacing: { after: 60, line: 264 }, children: Array.isArray(c) ? c : [run(c, { size: 19 })]
    })) : [new Paragraph({
      spacing: { after: 0, line: 264 },
      children: [run(String(content), {
        size: o.head ? 15 : 19,
        bold: o.head || o.first,
        color: o.head ? INK3 : (o.first ? INK : INK2)
      })]
    })]
  });
  const head = headers ? [new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => mk(h.toUpperCase(), { head: true, w: widths[i] }))
  })] : [];
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      ...head,
      ...rows.map(r => new TableRow({
        children: r.map((c, i) => mk(c, { w: widths[i], first: i === 0 }))
      }))
    ]
  });
}

// Spec card for one piece: a two-column key/value table with a title band.
function pieza(code, title, meta, specs) {
  const kids = [];
  kids.push(new Paragraph({
    spacing: { before: 300, after: 40 },
    children: [
      run(code + "   ", { size: 17, bold: true, color: GO, font: "Consolas" }),
      run(title, { size: 23, bold: true, color: INK })
    ]
  }));
  kids.push(new Paragraph({
    spacing: { after: 140 },
    children: [run(meta, { size: 17, color: INK3, font: "Consolas" })]
  }));
  const rows = specs.map(([k, v]) => [k, v]);
  kids.push(new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [1900, W - 1900],
    rows: rows.map(([k, v]) => new TableRow({
      children: [
        new TableCell({
          width: { size: 1900, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: "F4F6F8", color: "auto" },
          margins: { top: 90, bottom: 90, left: 140, right: 120 },
          borders: cellBorders, verticalAlign: VerticalAlign.TOP,
          children: [new Paragraph({ spacing: { after: 0, line: 264 }, children: [run(k, { size: 17, bold: true, color: INK3 })] })]
        }),
        new TableCell({
          width: { size: W - 1900, type: WidthType.DXA },
          margins: { top: 90, bottom: 90, left: 140, right: 140 },
          borders: cellBorders, verticalAlign: VerticalAlign.TOP,
          children: (Array.isArray(v) ? v : [v]).map((line, i, arr) => new Paragraph({
            spacing: { after: i === arr.length - 1 ? 0 : 70, line: 264 },
            children: Array.isArray(line) ? line : [run(line, { size: 19 })]
          }))
        })
      ]
    }))
  }));
  return kids;
}

// ============================ document: VENDEDORES ============================
const body = [];

body.push(new Paragraph({ spacing: { after: 90 },
  children: [run("CARAMÉS LANÚS ESTE   ·   BRIEF PARA COMMUNITY MANAGERS   ·   VENDEDORES   ·   12 DE NOVIEMBRE DE 2026",
    { size: 15, bold: true, color: INK3, font: "Consolas" })] }));
body.push(new Paragraph({ spacing: { after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } }, children: [] }));
body.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 200 },
  children: [run("Piezas para Meta Ads — propietarios que quieren vender", { size: 44, bold: true, color: INK })] }));
body.push(p("Todo lo que hay que producir para que Caramés capte propietarios de Lanús y alrededores que quieran vender su propiedad: qué piezas, para qué campaña, con qué medidas y fotos, qué texto va dentro de la imagen y qué texto va en el anuncio. Este brief es solo de vendedores. Compradores y alquileres no entran.",
  { size: 23, color: INK2, after: 260 }));

body.push(table(null, [
  ["Total de piezas", "13 piezas: 5 imágenes, 3 carruseles, 4 reels y 1 plantilla de story recurrente"],
  ["Prioridad 1 (semana del 17 al 21/11)", "A1 imagen «¿Cuánto vale tu propiedad?» · A2 carrusel del valor · A4 «Vendidas en tu barrio»"],
  ["Prioridad 2 (semana del 24 al 28/11)", "A3 reel «Lo que vale tu casa» · A5 carrusel «Así vendemos» · B1 reel «¿Cuánto tarda en venderse?»"],
  ["Prioridad 3 (semana del 1 al 5/12)", "B2 reel «3 errores con el precio» · B3 reel «Qué papeles necesitás» · C1 «Ya nos conocés» · C2 testimonio · C3 story semanal"],
  ["Entrega", "Carpeta de Drive «META · Vendedores · 2026-11», una subcarpeta por bloque (A, B, C), nombres según la sección 1"],
  ["Aprueba", "Gonzalo revisa datos de mercado, propiedades vendidas y textos antes de subir. Cada pieza lista se sube y se avisa; no esperar al bloque completo"]
], [2600, 6426]));
body.push(gap(220));

body.push(note("stop", "El cliente que buscamos y cómo lo filtra cada pieza",
  "Un vendedor calificado es un propietario de Lanús, Remedios de Escalada, Gerli o Valentín Alsina que quiere vender en los próximos meses, que en el primer mensaje manda la dirección y dice si es casa, PH o departamento, y que acepta una visita de tasación. No buscamos curiosos que preguntan «¿cuánto vale el m²?» y desaparecen.",
  "Por eso cada pieza da algo primero (un dato real del barrio, el proceso completo, una propiedad vendida de verdad), lo firma un martillero colegiado, y pide una sola cosa: «escribinos con la dirección». Preferimos 10 propietarios que manden la dirección antes que 100 mensajes de «info»."));
body.push(gap(140));
body.push(note("ok", "Empezá por acá",
  [run("La primera entrega es "), b("A1 (variante departamento) en 9:16"), run(", para el "), b("lunes 17/11"), run(". Hace cinco semanas que no corre ninguna pieza de vendedores y la campaña de WhatsApp está armada esperando esa imagen. Con esa sola pieza se publica. Después, en orden: A2 y A4 el viernes 21.")],
  [run("Material para arrancar, pedirlo a Gonzalo si no lo tenés: "), b("logo en vector y en PNG con fondo transparente"), run(", "), b("colores de marca en hexadecimal"), run(", "), b("tipografía de marca"), run(" (si no hay, Montserrat para títulos e Inter para textos), y "), b("la lista de propiedades vendidas por Caramés en los últimos meses"), run(" con barrio, mes de venta y autorización del dueño para mostrar la fachada. Sin esa lista no se pueden hacer A2, A3, A4 ni C2.")]));

// ---------------- SECCIÓN 1 ----------------
body.push(...h1("Sección 1", "Reglas de producción para todas las piezas"));

body.push(...h2("Qué hace que una pieza de vendedores califique"));
body.push(table(["Elemento", "Cómo va", "Por qué filtra"], [
  ["Dato real del barrio", "Precio promedio de publicación por m² de Lanús Este, con mes. Nunca redondeado hacia arriba. Siempre «promedio de publicación», nunca «tasación».", "El que tiene una propiedad hace la cuenta al instante. El que no, pasa de largo."],
  ["Oferta concreta", "«Tasación sin cargo en 48 hs». Siempre con el plazo. Nunca «consultá» ni «te asesoramos».", "Una promesa con plazo la toma el que de verdad quiere saber cuánto vale lo suyo."],
  ["Firma profesional", "«Diego G. Caramés · Martillero y Corredor Público · Col. 216 CPMCAL» en todas las piezas.", "El propietario le entrega su casa a una persona con nombre y matrícula, no a una marca."],
  ["Barrio exacto", "«Lanús Este», «Lanús Oeste», «Remedios de Escalada», «Gerli», «Valentín Alsina». Nunca «zona sur».", "El que vive en Lanús se siente nombrado. Los de afuera no escriben."],
  ["Pedido único", "«Escribinos por WhatsApp con la dirección y si es casa, PH o departamento».", "El que manda la dirección ya decidió. El que escribe «info» no."],
  ["Prueba de que vendemos", "Fachadas con sello «VENDIDA» y barrio, sin precio de cierre.", "Responde la duda que frena a todos: «¿y estos venden de verdad?»"]
], [1700, 4100, 3226]));
body.push(gap(160));

body.push(...h2("Formatos y medidas"));
body.push(table(["Formato", "Medida", "Dónde se usa", "Notas"], [
  ["Vertical 9:16", "1080 × 1920 px", "Stories, Reels, Facebook Reels", "El formato principal: es donde más se muestran los anuncios. Obligatorio en todas las imágenes."],
  ["Vertical 4:5", "1080 × 1350 px", "Feed de Instagram y Facebook", "Ocupa más pantalla que el 1:1. Segundo formato de todas las imágenes."],
  ["Cuadrado 1:1", "1080 × 1080 px", "Carruseles, feed", "Formato base de los carruseles (todas las tarjetas iguales)."],
  ["Video", "9:16, MP4, H.264, 30 fps, 15 a 20 s", "Reels y stories", "Subtítulos quemados siempre. Música solo de la biblioteca de Meta o sin música."]
], [1700, 1900, 2500, 2926]));
body.push(gap(160));

body.push(...h2("Fotos y tomas: qué hace falta y cómo"));
body.push(table(["Material", "Para qué piezas", "Formato y tamaño mínimo", "Cómo tiene que ser"], [
  ["Fachadas de propiedades vendidas por Caramés (6 a 8)", "A2, A3, A4, B1, C2, C3", "Horizontal 4000 × 3000 px o más y, si se puede, vertical 3000 × 4000. JPG original, no de WhatsApp", "De día, desde la vereda de enfrente, calle arbolada, sin autos tapando la entrada, cielo despejado. Con autorización del dueño. Nunca una propiedad en venta hoy"],
  ["Fachada de edificio y living de un departamento real de Lanús Este", "A1-b, A2 tarjeta 2", "Vertical 3000 × 4000 y horizontal 4000 × 3000", "Living luminoso con ventana a la vista, de día, luces prendidas, persianas levantadas, sin personas ni objetos personales"],
  ["Fachada de casa o PH real de Lanús Este", "A1-a, A2 tarjeta 3", "Vertical y horizontal, 3000 px o más", "Igual que arriba; idealmente una vendida por Caramés"],
  ["Diego a cámara", "A3, B1, B2, B3", "Video vertical 1080 × 1920, 30 fps, celular en trípode a la altura de los ojos", "Luz de frente (ventana o aro de luz), fondo limpio (oficina o fachada de la sucursal), tomas de 6 a 10 segundos, sin leer: frases cortas"],
  ["Visita de tasación", "A3, B1", "Video vertical, tomas de 4 a 6 s", "Diego midiendo un ambiente, mirando una escritura, saludando en una puerta. Sin mostrar la cara del propietario"],
  ["Documentación", "B3", "Foto horizontal 4000 px", "Escritura, plano y boleta de ABL sobre una mesa, nombres y números tapados o desenfocados"],
  ["Sucursal", "C1", "Horizontal 4000 px o más", "Tucumán 1199 esq. Anatole France, de día, cartel legible, sin gente en la puerta"],
  ["Cliente que vendió (testimonio)", "C2", "Foto horizontal del cliente frente a su ex propiedad o texto sobre fachada", "Solo con autorización escrita. Si no quiere salir, va su frase sobre la fachada con nombre de pila y barrio"]
], [2000, 1500, 2400, 3126]));
body.push(gap(160));

body.push(...h2("Zonas seguras en 9:16"));
body.push(p("Instagram y Facebook superponen la barra de perfil arriba y los botones abajo. Todo texto, dato y logo tiene que quedar dentro del área segura:"));
body.push(bullet([b("Arriba: "), run("250 px libres (el 13% superior). Nada de texto ahí.")]));
body.push(bullet([b("Abajo: "), run("340 px libres (el 18% inferior). Ahí va el botón del anuncio; si ponemos un botón dibujado, va justo por encima de esa franja.")]));
body.push(bullet([b("Laterales: "), run("60 px de margen a cada lado.")]));
body.push(bullet([b("Área útil real: "), run("1080 × 1330 px, entre los píxeles 250 y 1580 de alto.")]));
body.push(gap(120));

function zona(label, px, fill, color, bold) {
  return new TableRow({
    height: { value: Math.max(Math.round(px * 3), 330), rule: HeightRule.EXACT }, cantSplit: true,
    children: [new TableCell({
      width: { size: 3240, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill, color: "auto" },
      borders: cellBorders, verticalAlign: VerticalAlign.CENTER,
      margins: { top: 40, bottom: 40, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0, line: 240 },
        children: [run(label, { size: 14, color, bold })] })]
    })]
  });
}
function esquema916() {
  const filas = [
    zona("0–250 · ZONA RESERVADA · barra de perfil", 250, "F9E9E6", ALERT, true),
    zona("250–300 · margen", 50, "FFFFFF", INK3, false),
    zona("300–520 · TITULAR · 2 líneas · 84 px · blanco", 220, "E7EAF7", NEUTRAL, true),
    zona("520–900 · FOTO LIMPIA, sin texto", 380, "F4F6F8", INK3, false),
    zona("900–1150 · DATO GRANDE · USD 1.711 por m²", 250, "E7EAF7", NEUTRAL, true),
    zona("1150–1200 · leyenda del dato · 40 px", 50, "FFFFFF", INK3, false),
    zona("1200–1360 · FRANJA color marca · Tasación sin cargo 48 hs", 160, "E4F1EC", GO, true),
    zona("1400–1520 · firma martillero 32 px · logo 140 px", 160, "F4F6F8", INK3, false),
    zona("1580–1920 · ZONA RESERVADA · botón y texto del anuncio", 340, "F9E9E6", ALERT, true)
  ];
  const lienzo = new Table({ width: { size: 3240, type: WidthType.DXA }, columnWidths: [3240], rows: filas });
  const notas = [
    p([b("Cómo leer el esquema.")], { after: 80 }),
    p("Es el lienzo de 1080 × 1920 visto de frente, a escala. Las dos franjas rojas son las zonas que Instagram y Facebook tapan con su propia interfaz: ahí no va nada. Titular, dato, franja, firma y logo caen entre los 250 y los 1580 px de alto.", { after: 120 }),
    p("Los márgenes laterales son de 60 px: el texto nunca toca el borde.", { after: 120 }),
    p("Es la estructura de A1 y C1. En A4 la foto se reemplaza por el collage de fachadas y el dato grande por el titular «4 vendidas en Lanús este mes».", { after: 120 }),
    p("En 4:5 y 1:1 no hay zonas reservadas tan grandes, pero conviene dejar 60 px libres en los cuatro bordes.", { after: 0 })
  ];
  const celda = (kids, w) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.TOP, margins: { top: 0, bottom: 0, left: 0, right: 200 }, children: kids });
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [3440, W - 3440],
    borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({ children: [celda([lienzo], 3440), celda(notas, W - 3440)] })]
  });
}
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h2("Esquema del lienzo 9:16 (pieza A1)"));
body.push(esquema916());
body.push(gap(160));

body.push(...h2("Texto dentro de la imagen"));
body.push(bullet([b("Titular: "), run("máximo 2 líneas, 6 a 8 palabras, cuerpo mínimo 72 px en 9:16 y 64 px en 1:1. Se tiene que leer en un celular sin hacer zoom.")]));
body.push(bullet([b("Dato de m²: "), run("cuerpo igual o mayor que el titular, con leyenda «promedio de publicación · Lanús Este · mes» en 40 px debajo. Es lo que hace que el propietario se detenga.")]));
body.push(bullet([b("Franja de oferta: "), run("«Tasación sin cargo en 48 hs», sólida, color de marca, texto blanco 56 px. Va en todas las piezas de captación.")]));
body.push(bullet([b("Firma: "), run("«Diego G. Caramés · Martillero y Corredor Público · Col. 216 CPMCAL» en 32 px, gris claro, sobre fondo que lo deje leer. En todas las piezas.")]));
body.push(bullet([b("Logo: "), run("abajo a la derecha, 140 px de ancho. Nunca en el centro.")]));
body.push(bullet([b("Contraste: "), run("sobre fotos, franja sólida o degradado oscuro al 50% debajo del texto.")]));
body.push(bullet([b("No usar: "), run("«Comentá VENDER», «link en bio», «vendé rápido», «mejor precio», plazos de venta prometidos, precios de cierre de propiedades vendidas, emojis dentro de la imagen, texto en rojo.")]));
body.push(gap(120));

body.push(...h2("Dato de mercado (copiar tal cual)"));
body.push(table(null, [
  ["Departamentos", "USD 1.711 por m² · promedio de publicación · Lanús Este · octubre 2026"],
  ["PH", "USD 725 por m² sobre superficie total · promedio de publicación · Lanús Este · octubre 2026"],
  ["Casas", "USD 671 por m² sobre superficie total · promedio de publicación · Lanús Este · octubre 2026"],
  ["Fuente", "Planilla VALORES_REFERENCIA_ZONAS, fila Lanús Este, mediana de avisos de Zonaprop. Se recalcula cada mes: si la pieza sale en diciembre, pedir el valor nuevo a Gonzalo antes de exportar"],
  ["Regla", "Nunca redondear hacia arriba. Nunca escribir «tasación» al lado del dato: es un promedio de publicación, no el valor de ninguna propiedad"]
], [2000, 7026]));
body.push(gap(160));

body.push(...h2("Qué pasa después del clic (para que la pieza y el chat digan lo mismo)"));
body.push(p("Todas las piezas de captación llevan al WhatsApp de ventas (11 6278-2740). Al tocar el botón, la persona recibe este mensaje automático y dos botones. La pieza tiene que prometer exactamente eso y nada más:"));
body.push(note("info", "Mensaje de bienvenida del anuncio",
  "«Hola, gracias por escribir a Caramés. Para la tasación sin cargo decinos la dirección y si es casa, PH o departamento. Te respondemos en el día.»",
  "Botones: «Quiero tasar mi propiedad» · «Quiero vender»"));
body.push(gap(160));

body.push(...h2("Especificaciones técnicas de Meta"));
body.push(table(["Tipo", "Requisito", "Recomendación"], [
  ["Imagen", "JPG o PNG · hasta 30 MB · mínimo 1080 px de ancho", "JPG calidad 90, perfil sRGB, sin capas. 1080 × 1920, 1080 × 1350 o 1080 × 1080 exactos."],
  ["Video", "MP4 o MOV · H.264 · hasta 4 GB · relación 9:16 exacta", "1080 × 1920, 30 fps, audio AAC 128 kbps, 15 a 20 s. Primer cuadro con el mensaje principal (es la miniatura)."],
  ["Carrusel", "2 a 10 tarjetas, todas del mismo tamaño", "1080 × 1080 todas; si una queda 1080 × 1350 Meta recorta las demás."],
  ["Texto en imagen", "Meta baja el alcance de imágenes muy cargadas", "Máximo titular + dato + franja + firma. Nada más."],
  ["Contraste", "Legible en celular al sol", "Relación mínima 4,5:1 entre texto y fondo (contrast-ratio.com)."],
  ["Versiones", "Meta recorta automáticamente si falta un formato", "Entregar siempre 9:16 y 4:5; el recorte automático corta el dato o el logo."]
], [1500, 3300, 4226]));
body.push(gap(160));

body.push(...h2("Preguntas frecuentes"));
body.push(table(null, [
  ["¿Puedo usar Canva?", "Sí. Exportar siempre en JPG, calidad alta, tamaño exacto."],
  ["¿Qué tipografía uso?", "La de marca si existe. Si no, Montserrat (títulos y números) e Inter (textos). Nunca más de dos por pieza."],
  ["¿Puedo cambiar el texto del anuncio?", "El texto dentro de la imagen, dentro de lo que dice cada ficha, sí. El texto principal, titular y botón los carga Gonzalo tal como están en el anexo; si tenés una idea mejor, proponela antes de producir."],
  ["¿Puedo usar fotos de propiedades que están en venta?", "No. Solo vendidas por Caramés con autorización, o fachadas de calles de Lanús sin identificar una propiedad puntual."],
  ["¿Qué hago si el dato de m² cambia?", "Pedir el valor nuevo a Gonzalo antes de exportar y anotar el mes en el nombre del archivo."],
  ["¿Dónde subo las piezas?", "Carpeta de Drive «META · Vendedores · 2026-11», subcarpetas A, B y C. Al subir, avisar por WhatsApp con el código de la pieza."],
  ["¿Puedo entregar una pieza antes que las otras del bloque?", "Sí, y es lo que conviene. Cada pieza que llega se publica sola."]
], [3000, 6026]));
body.push(gap(160));

body.push(...h2("Datos fijos de marca (copiar tal cual)"));
body.push(table(null, [
  ["Razón social", "Caramés Bienes Raíces · Sucursal Lanús Este"],
  ["Dirección", "Tucumán 1199 esq. Anatole France, Lanús Este"],
  ["Teléfono", "4247-4336"],
  ["WhatsApp ventas (el de todas estas piezas)", "11 6278-2740"],
  ["Instagram", "@carameslanuseste"],
  ["Web", "www.caramespropiedades.com.ar"],
  ["Tasador", "Diego Gonzalo Caramés · Martillero y Corredor Público · Colegiado N° 216 · CPMCAL"]
], [2600, 6426]));
body.push(gap(160));

body.push(...h2("Nombres de archivo y entrega"));
body.push(p([run("Convención: "), mono("BLOQUE_pieza_formato_vNN.ext"), run(". Ejemplos: "), mono("A_A1b-depto_9x16_oct26_v01.jpg"), run(", "), mono("A_A2-carrusel_1x1_tarjeta03_v01.jpg"), run(", "), mono("B_B1-cuanto-tarda_9x16_v01.mp4"), run(".")]));
body.push(bullet("JPG calidad 90 para imágenes, MP4 para video."));
body.push(bullet("Junto con cada pieza, un archivo de texto con el copy del anuncio (texto principal, titular, descripción) tal como está en el anexo."));
body.push(bullet("Las piezas con dato de mercado llevan el mes en el nombre (oct26)."));

// ---------------- BLOQUE A ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque A · Captación", "Piezas que piden la dirección (campaña de WhatsApp para vendedores)"));
body.push(note("stop", "Situación",
  "La campaña «Vendedores - Tasación - WhatsApp» está armada (Lanús + 17 km, 35 a 65 años, optimiza conversaciones de WhatsApp) y lleva cinco semanas esperando una pieza. Lo único que corrió fue el video «Verdadero o Falso», que Meta ubica en el 10% de menor interacción, y un retargeting a visitantes de la web que gastó ARS 38.000 para cero resultados.",
  "Estas cinco piezas van todas al mismo conjunto. Meta elige cuál mostrar a cada persona; por eso conviene que cuenten lo mismo desde ángulos distintos: el dato (A1, A2), la prueba (A4), el proceso (A5) y la persona (A3)."));
body.push(gap(120));

body.push(...pieza("A1", "Imagen estática · «¿Cuánto vale tu propiedad en Lanús Este?»",
  "2 variantes (casa/PH y departamento) × 2 formatos (9:16 y 4:5) = 4 archivos · prioridad 1 · entrega: A1-b departamento 9:16 el lunes 17/11; el resto el viernes 21/11", [
  ["Objetivo", "Que un propietario se detenga en un número real y mande la dirección por WhatsApp. Es la pieza principal."],
  ["Variantes", [
    [b("A1-a Casa/PH: "), run("fachada de una casa o PH real de Lanús Este, de día, calle arbolada. Idealmente una vendida por Caramés.")],
    [b("A1-b Departamento: "), run("living luminoso de un departamento real de la zona, o fachada de edificio de Lanús Este.")]
  ]],
  ["Composición 9:16", [
    "Foto a sangre en los 1920 px, con degradado oscuro del 0% al 60% desde la mitad hacia abajo.",
    "Entre los 300 y 520 px, titular en blanco, 2 líneas, 84 px: «¿Cuánto vale tu propiedad en Lanús Este?»",
    "Entre los 900 y 1150 px, el dato grande, 120 px: «USD 1.711 por m²» en A1-b y «USD 725 por m²» en A1-a (para casa, USD 671). Debajo, 40 px: «Promedio de publicación · Lanús Este · octubre 2026» (en A1-a agregar «sobre superficie total»).",
    "Entre los 1200 y 1360 px, franja sólida de color de marca con texto blanco 56 px: «Tasación sin cargo en 48 hs».",
    "Entre los 1400 y 1520 px, en 32 px gris claro: «Diego G. Caramés · Martillero y Corredor Público · Col. 216 CPMCAL». Logo abajo a la derecha."
  ]],
  ["Composición 4:5", "Misma jerarquía: foto en los dos tercios superiores, franja sólida inferior con el dato de m² a la izquierda y «Tasación sin cargo en 48 hs» a la derecha. Firma y logo abajo."],
  ["Texto principal del anuncio", "¿Tenés una propiedad en Lanús Este y querés saber cuánto vale hoy? Te hacemos la tasación sin cargo y sin compromiso: visitamos, comparamos con lo que se está vendiendo en tu cuadra y en 48 hs tenés el informe firmado por un martillero colegiado. Escribinos por WhatsApp con la dirección y si es casa, PH o departamento, y coordinamos."],
  ["Titular", "Tasación sin cargo en 48 hs"],
  ["Descripción", "Caramés Bienes Raíces · Lanús Este"],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No «vendé rápido», no «mejor precio», no promesas de plazo. No fotos de propiedades en venta de otros clientes."]
]));

body.push(...pieza("A2", "Carrusel · «Lo que vale tu propiedad, en 5 tarjetas»",
  "5 tarjetas 1:1 (1080 × 1080) · prioridad 1 · entrega: viernes 21/11", [
  ["Objetivo", "Darle al propietario los datos que busca antes de escribir: cuánto vale, cómo es el proceso, quién lo hace."],
  ["Tarjeta 1 · Gancho", "Fondo sólido de color de marca. Texto blanco 96 px, centrado, 3 líneas: «¿Cuánto vale tu propiedad hoy?». Abajo en 36 px: «Deslizá →». Logo arriba a la izquierda."],
  ["Tarjeta 2 · Departamentos", "Foto de edificio o living de Lanús Este con franja inferior. «Departamentos en Lanús Este» (48 px) · «USD 1.711/m²» (120 px) · «promedio de publicación · octubre 2026» (32 px)."],
  ["Tarjeta 3 · Casas y PH", "Misma estructura con fachada de casa. «Casas y PH en Lanús Este» · «PH USD 725/m² · Casas USD 671/m²» · «sobre superficie total · promedio de publicación · octubre 2026»."],
  ["Tarjeta 4 · Cómo funciona", "Fondo claro, tres pasos en columna con número grande: «1 · Nos escribís con la dirección» / «2 · Visitamos tu propiedad (30 minutos)» / «3 · En 48 hs recibís el informe firmado». Debajo: «Sin cargo. Sin compromiso.»"],
  ["Tarjeta 5 · Confianza + CTA", "Collage de 3 fachadas vendidas por Caramés con sello «VENDIDA» en diagonal y el barrio debajo, sin precios. Franja inferior: «Diego G. Caramés · Martillero Col. 216 CPMCAL» y «Escribinos por WhatsApp». Logo."],
  ["Texto principal del anuncio", "Antes de decidir, conocé el valor real de tu propiedad. Estos son los valores promedio de publicación en Lanús Este este mes. Si querés saber cuánto vale la tuya, escribinos con la dirección: te hacemos la tasación sin cargo en 48 hs."],
  ["Titulares por tarjeta", ["T1: ¿Cuánto vale tu propiedad?", "T2: Departamentos · USD 1.711/m²", "T3: Casas y PH · USD 725 y 671/m²", "T4: Así trabajamos", "T5: Tasación sin cargo"]],
  ["Botón", "Enviar mensaje de WhatsApp (en las 5 tarjetas)"],
  ["Qué evitar", "No mezclar tipografías entre tarjetas. No más de dos colores de marca. No precios de cierre de las vendidas."]
]));

body.push(...pieza("A3", "Reel 15 s · «Lo que vale tu casa en Lanús Este»",
  "1 video 9:16, 15 segundos, con subtítulos · prioridad 2 · entrega: viernes 28/11 (guion aprobado antes de grabar)", [
  ["Objetivo", "Mismo mensaje que A1 en video, con Diego a cámara: la persona que va a ir a la casa del propietario."],
  ["Segundos 0 a 2", "Pantalla con el número grande (USD 1.711/m², departamentos) y voz o texto: «Esto vale hoy el metro en Lanús Este». Sin logo, sin intro."],
  ["Segundos 2 a 6", "Tres fachadas vendidas por Caramés, 1,3 s cada una, con «VENDIDA · [barrio]» en 64 px. Zoom suave."],
  ["Segundos 6 a 11", "Diego a cámara: «Si tenés una propiedad en Lanús, te decimos cuánto vale. Sin cargo, sin compromiso, en 48 horas. Mandanos la dirección.»"],
  ["Segundos 11 a 15", "Pantalla final: «Tasación sin cargo en 48 hs» (84 px) · «Escribinos por WhatsApp con la dirección» (48 px) · «Diego G. Caramés · Martillero Col. 216» (32 px) · logo. 4 segundos completos."],
  ["Subtítulos", "Quemados, blancos con borde negro, 56 px, centrados entre los 1300 y 1500 px de alto."],
  ["Audio", "Voz clara sin música, o instrumental de la biblioteca de Meta a volumen bajo."],
  ["Texto principal del anuncio", "Mismo que A1."],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("A4", "Imagen · «Vendidas en Lanús este mes» (prueba social)",
  "1 imagen × 2 formatos (9:16 y 4:5) · prioridad 1 · entrega: viernes 21/11 · se rehace cada mes con las ventas nuevas", [
  ["Objetivo", "Responder la duda que frena al propietario: «¿y estos venden de verdad?». Sin hablar de precios."],
  ["Composición", "Collage de 4 fachadas vendidas por Caramés en los últimos meses, en cuadrícula de 2 × 2, cada una con sello «VENDIDA» en diagonal y el barrio en 36 px («Lanús Este», «Remedios de Escalada»). Titular en franja superior, 72 px: «4 propiedades vendidas en Lanús este mes». Franja inferior de color de marca: «La tuya puede ser la próxima · Tasación sin cargo en 48 hs». Firma y logo."],
  ["Qué pedir a Gonzalo", "Lista de 4 a 6 vendidas recientes con autorización del dueño y el mes de venta. Si hay menos de 4, el titular dice «Vendidas en Lanús» sin número."],
  ["Texto principal del anuncio", "Estas propiedades se vendieron en Lanús con Caramés. Si estás pensando en vender la tuya, escribinos con la dirección: te decimos cuánto vale hoy, sin cargo y sin compromiso."],
  ["Titular", "Vendidas en Lanús este mes"],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No precios de cierre ni tiempos de venta exactos. No propiedades de otras inmobiliarias. No usar la misma foto que en A1."]
]));

body.push(...pieza("A5", "Carrusel · «Así vendemos tu propiedad» (el proceso completo)",
  "6 tarjetas 1:1 · prioridad 2 · entrega: viernes 28/11", [
  ["Objetivo", "Que el propietario entienda qué va a pasar si escribe, de punta a punta. El que lee las 6 tarjetas y escribe, va en serio."],
  ["Tarjeta 1", "Fondo de marca: «Así vendemos tu propiedad en Lanús» (84 px) · «6 pasos, sin sorpresas» (40 px) · «Deslizá →»."],
  ["Tarjeta 2 · Tasación", "Foto de Diego midiendo un ambiente. «1 · Tasación sin cargo en 48 hs» · «Visitamos, comparamos con tu cuadra, informe firmado por martillero»."],
  ["Tarjeta 3 · Fotos y ficha", "Foto de un living bien iluminado. «2 · Fotos profesionales y ficha completa» · «Tu propiedad se ve como merece»."],
  ["Tarjeta 4 · Publicación", "Captura limpia de la ficha en un portal (sin precio visible). «3 · Publicación en todos los portales y redes» · «Zonaprop, Argenprop, Mercado Libre, Instagram, Facebook»."],
  ["Tarjeta 5 · Visitas y oferta", "Foto de una puerta abierta o llaves. «4 · Coordinamos las visitas» · «5 · Te presentamos cada oferta y la negociamos con vos»."],
  ["Tarjeta 6 · Escritura + CTA", "Foto de documentación desenfocada. «6 · Te acompañamos hasta la escritura» · «¿Empezamos por la tasación? Escribinos con la dirección» · firma y logo."],
  ["Texto principal del anuncio", "Vender una propiedad tiene seis pasos y en todos estamos nosotros: tasación, fotos, publicación, visitas, oferta y escritura. Si tenés una propiedad en Lanús y querés arrancar, escribinos con la dirección: el primer paso es sin cargo."],
  ["Titular por tarjeta", ["T1 Así vendemos tu propiedad", "T2 Tasación sin cargo", "T3 Fotos profesionales", "T4 En todos los portales", "T5 Visitas y oferta", "T6 Hasta la escritura"]],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No comisiones ni porcentajes en la imagen. No «exclusividad». No fotos de banco."]
]));

// ---------------- BLOQUE B ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque B · Educativo", "Reels para público frío (campaña de reconocimiento, conjunto vendedores)"));
body.push(note("warn", "Situación",
  "El conjunto «reconocimiento - vendedores» muestra hoy el video viejo «Verdadero o Falso» a gente de Lanús que no conoce a Caramés. Meta lo ubica en el 10% de menor interacción. Las piezas educativas anteriores tenían buena retención (28% llegaba al 25% del video) pero no pedían nada al final.",
  "Estos tres reels reemplazan al «Verdadero o Falso». Cada uno da un dato que un propietario quiere saber, lo dice Diego, y cierra pidiendo la dirección. Se mide por reproducciones completas y por la gente que escribe después, no por costo."));
body.push(gap(120));

body.push(...pieza("B1", "Reel 20 s · «¿Cuánto tarda en venderse una casa en Lanús?»",
  "1 video 9:16, 20 segundos, subtítulos · prioridad 2 · entrega: viernes 28/11 (guion aprobado antes de grabar)", [
  ["Segundos 0 a 2", "Texto grande sobre fondo oscuro: «¿Cuánto tarda en venderse una casa en Lanús?». Voz: «Te lo decimos con números». Sin logo."],
  ["Segundos 2 a 8", "Diego a cámara: el tiempo típico de venta en la zona cuando el precio está bien puesto, y qué pasa cuando está un 15% arriba (pedirle a Gonzalo los dos datos reales antes de grabar)."],
  ["Segundos 8 a 14", "Tres cosas que aceleran la venta: precio de publicación real, fotos profesionales, publicación en todos los portales. Texto 64 px por cada una sobre planos de fachadas vendidas."],
  ["Segundos 14 a 20", "Cierre: «Si querés saber cuánto vale la tuya, escribinos con la dirección» · «Tasación sin cargo en 48 hs» · firma · logo. 4 segundos completos."],
  ["Texto principal del anuncio", "¿Cuánto tarda en venderse una casa en Lanús? Depende de una sola cosa: el precio de publicación. En este video te contamos lo que vemos todos los meses. Si querés saber cuánto vale la tuya, escribinos con la dirección."],
  ["Titular", "¿Cuánto tarda en venderse una casa en Lanús?"],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("B2", "Reel 20 s · «3 errores al poner el precio»",
  "1 video 9:16, 20 segundos, subtítulos · prioridad 3 · entrega: viernes 5/12", [
  ["Segundos 0 a 2", "Texto grande: «El error N° 1 al vender en Lanús». Voz: «Lo vemos todas las semanas». Sin logo."],
  ["Segundos 2 a 8", "Error 1: «Poner el precio que necesitás, no el que vale». Diego a cámara, una frase."],
  ["Segundos 8 a 13", "Error 2: «Copiar el precio del vecino que todavía no vendió». Plano de un cartel «En venta» desde la calle."],
  ["Segundos 13 a 17", "Error 3: «Bajar el precio de a poco: la propiedad se quema». Texto sobre plano de una fachada."],
  ["Segundos 17 a 20", "Cierre: «Empezá por saber cuánto vale de verdad» · «Tasación sin cargo en 48 hs · escribinos con la dirección» · firma · logo."],
  ["Texto principal del anuncio", "Estos son los 3 errores que más vemos cuando alguien pone en venta su propiedad en Lanús. Los tres tienen que ver con el precio. Si querés arrancar bien, escribinos con la dirección: te decimos cuánto vale, sin cargo."],
  ["Titular", "3 errores al poner el precio"],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("B3", "Reel 20 s · «Qué papeles necesitás para vender»",
  "1 video 9:16, 20 segundos, subtítulos · prioridad 3 · entrega: viernes 5/12 (lista de documentos confirmada por Gonzalo)", [
  ["Segundos 0 a 2", "Texto grande: «Para vender tu propiedad necesitás esto». Plano de documentos sobre la mesa, nombres tapados."],
  ["Segundos 2 a 15", "Diego a cámara nombrando cada documento mientras aparece en texto 64 px: título de propiedad (escritura), plano aprobado o cédula, ABL y servicios al día, DNI de los titulares, y lo que corresponda según el caso (sucesión, poder, reglamento de copropiedad). Una línea por documento, 2 a 3 segundos cada una."],
  ["Segundos 15 a 20", "Cierre: «Si te falta alguno, te ayudamos a conseguirlo» · «Tasación sin cargo en 48 hs · escribinos con la dirección» · firma · logo."],
  ["Texto principal del anuncio", "Antes de publicar tu propiedad conviene tener los papeles listos: así la venta no se frena cuando aparece el comprador. En este video te contamos cuáles son. Si querés vender en Lanús, escribinos con la dirección y arrancamos con la tasación sin cargo."],
  ["Titular", "Qué papeles necesitás para vender"],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No dar asesoramiento legal específico ni plazos de sucesión. Nombrar los documentos, no explicarlos."]
]));

// ---------------- BLOQUE C ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque C · Refuerzo", "Para quienes ya conocen a Caramés (conjunto de refuerzo y stories)"));
body.push(note("ok", "Situación",
  "Hay 22.000 a 25.000 personas que interactuaron con la página de Facebook y 68.000 a 80.000 con el Instagram en el último año. Muchos son vecinos de Lanús con propiedad. A ellos no hace falta explicarles quién es Caramés: hay que recordarles que tasamos sin cargo y mostrar que seguimos vendiendo."));
body.push(gap(120));

body.push(...pieza("C1", "Imagen · «Ya nos conocés»",
  "1 imagen × 2 formatos (9:16 y 4:5) · prioridad 3 · entrega: viernes 5/12", [
  ["Objetivo", "Recordatorio corto con la misma oferta, para el conjunto de refuerzo (gente que ya interactuó con la página o el perfil)."],
  ["Composición", "Fachada de la sucursal (Tucumán 1199 esq. Anatole France), de día. Franja sólida inferior con «¿Pensás vender? Tasación sin cargo en 48 hs» y el WhatsApp de ventas escrito: «11 6278-2740». Firma y logo."],
  ["Texto principal del anuncio", "Ya conocés Caramés. Si estás pensando en vender tu propiedad en Lanús, te hacemos la tasación sin cargo y te decimos cuánto vale hoy. Escribinos con la dirección y coordinamos la visita."],
  ["Titular", "¿Pensás vender? Tasación sin cargo"],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("C2", "Imagen · Testimonio de un propietario que vendió",
  "1 imagen × 2 formatos (9:16 y 4:5) · prioridad 3 · entrega: viernes 5/12 · se repite con un cliente distinto cada mes", [
  ["Objetivo", "La voz de un vecino que ya pasó por el proceso vale más que cualquier promesa nuestra."],
  ["Composición", "Fachada de la propiedad vendida con sello «VENDIDA» y barrio. Sobre franja oscura al 60%, la frase del cliente entre comillas en 64 px (máximo 20 palabras), y debajo «[Nombre de pila], vendió su [tipo] en [barrio]» en 36 px. Franja inferior: «Tasación sin cargo en 48 hs». Firma y logo."],
  ["Qué pedir a Gonzalo", "Un cliente que haya vendido en los últimos tres meses, su frase (puede ser de un audio de WhatsApp transcripto) y autorización escrita para usar nombre de pila, barrio y fachada."],
  ["Texto principal del anuncio", "«[frase del cliente]». [Nombre] vendió su [tipo] en [barrio] con Caramés. Si estás pensando en vender la tuya, escribinos con la dirección: te decimos cuánto vale, sin cargo."],
  ["Titular", "Vendió con Caramés"],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No inventar frases. No apellido, no precio, no foto del cliente si no la autorizó por escrito."]
]));

body.push(...pieza("C3", "Plantilla de story · «Esta semana en Lanús» (recurrente)",
  "1 plantilla 9:16 editable + 1 story por semana · prioridad 3 · entrega: plantilla el viernes 5/12, después una story cada viernes", [
  ["Objetivo", "Mantener presente a Caramés como la inmobiliaria que vende y tasa en Lanús, en el perfil orgánico y como anuncio de refuerzo. Es la pieza que sostiene el resto entre entregas."],
  ["Estructura", "Fondo de color de marca. Arriba (300 a 520 px): «Esta semana en Lanús» en 84 px. Centro (600 a 1300 px): dos o tres líneas con dato real de la semana, 64 px: «3 tasaciones hechas», «1 propiedad vendida en Lanús Este», «2 visitas coordinadas». Abajo (1350 a 1520 px): «¿Querés saber cuánto vale la tuya? Escribinos» · firma · logo."],
  ["Datos", "Los manda Gonzalo cada viernes por WhatsApp: cantidad de tasaciones, ventas y visitas de la semana. Si una semana no hay ventas, se omite esa línea; nunca inventar."],
  ["Uso", "Se publica en stories del perfil con el sticker de enlace a WhatsApp, y la misma pieza se carga como anuncio en el conjunto de refuerzo."],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

// ---------------- CALENDARIO ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Calendario y checklist", "Qué entregar cada semana"));
body.push(table(["Semana", "Piezas", "Archivos", "Quién revisa"], [
  ["Semana 1 (lunes 17 al viernes 21/11)", "Lunes 17: A1-b depto 9:16 · Viernes 21: resto de A1, A2 carrusel, A4 vendidas", "4 + 5 + 2 = 11 archivos + copys", "Gonzalo: dato de m² y lista de vendidas"],
  ["Semana 2 (24 al 28/11)", "A3 reel · B1 reel «¿Cuánto tarda?» · A5 carrusel «Así vendemos»", "2 videos + 6 = 8 archivos + copys", "Gonzalo: guiones antes de grabar, datos de tiempo de venta"],
  ["Semana 3 (1 al 5/12)", "B2 reel «3 errores» · B3 reel «papeles» · C1 «Ya nos conocés» · C2 testimonio · C3 plantilla de story", "2 videos + 2 + 2 + 1 plantilla = 7 archivos + copys", "Gonzalo: lista de documentos, cliente del testimonio"],
  ["Continuo", "C3 story cada viernes con los datos de la semana · A4 se rehace cada mes con las ventas nuevas · C2 cliente distinto cada mes", "", "Gonzalo manda los datos los viernes"]
], [2000, 3626, 2000, 1400]));
body.push(gap(200));

body.push(...h2("Antes de entregar cada pieza, verificar"));
body.push(bullet("El dato de m² es el de la tabla de la sección 1, dice «promedio de publicación» y el mes."));
body.push(bullet("Dice «Tasación sin cargo en 48 hs», con el plazo."));
body.push(bullet("Está la firma «Diego G. Caramés · Martillero y Corredor Público · Col. 216 CPMCAL»."));
body.push(bullet("Las fachadas son de propiedades vendidas por Caramés con autorización, con sello «VENDIDA» y barrio, sin precio."));
body.push(bullet("Ningún texto cae en los 250 px de arriba ni en los 340 px de abajo (9:16)."));
body.push(bullet("El titular se lee en un celular a un brazo de distancia."));
body.push(bullet("El texto del anuncio termina pidiendo la dirección y el tipo de propiedad."));
body.push(bullet("No hay «Comentá VENDER», «vendé rápido», plazos prometidos, comisiones ni fotos de banco."));
body.push(bullet("El archivo se llama según la convención y está en la subcarpeta del bloque."));
body.push(gap(160));

body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Anexo", "Textos de los anuncios, listos para copiar"));
body.push(p("Cada pieza se entrega con un archivo de texto con estas líneas, para que quien carga en Ads Manager copie y pegue sin reescribir. Todos los botones son «Enviar mensaje de WhatsApp» y todos los textos cierran pidiendo la dirección.", { after: 200 }));
body.push(table(["Pieza", "Texto principal", "Titular"], [
  ["A1 · Imagen del valor", "¿Tenés una propiedad en Lanús Este y querés saber cuánto vale hoy? Te hacemos la tasación sin cargo y sin compromiso: visitamos, comparamos con lo que se está vendiendo en tu cuadra y en 48 hs tenés el informe firmado por un martillero colegiado. Escribinos por WhatsApp con la dirección y si es casa, PH o departamento, y coordinamos.", "Tasación sin cargo en 48 hs"],
  ["A2 · Carrusel del valor", "Antes de decidir, conocé el valor real de tu propiedad. Estos son los valores promedio de publicación en Lanús Este este mes. Si querés saber cuánto vale la tuya, escribinos con la dirección: te hacemos la tasación sin cargo en 48 hs.", "T1 ¿Cuánto vale tu propiedad? · T2 Departamentos · USD 1.711/m² · T3 Casas y PH · USD 725 y 671/m² · T4 Así trabajamos · T5 Tasación sin cargo"],
  ["A3 · Reel del valor", "Mismo texto que A1.", "Tasación sin cargo en 48 hs"],
  ["A4 · Vendidas este mes", "Estas propiedades se vendieron en Lanús con Caramés. Si estás pensando en vender la tuya, escribinos con la dirección: te decimos cuánto vale hoy, sin cargo y sin compromiso.", "Vendidas en Lanús este mes"],
  ["A5 · Así vendemos", "Vender una propiedad tiene seis pasos y en todos estamos nosotros: tasación, fotos, publicación, visitas, oferta y escritura. Si tenés una propiedad en Lanús y querés arrancar, escribinos con la dirección: el primer paso es sin cargo.", "T1 Así vendemos tu propiedad · T2 Tasación sin cargo · T3 Fotos profesionales · T4 En todos los portales · T5 Visitas y oferta · T6 Hasta la escritura"],
  ["B1 · ¿Cuánto tarda?", "¿Cuánto tarda en venderse una casa en Lanús? Depende de una sola cosa: el precio de publicación. En este video te contamos lo que vemos todos los meses. Si querés saber cuánto vale la tuya, escribinos con la dirección.", "¿Cuánto tarda en venderse una casa en Lanús?"],
  ["B2 · 3 errores con el precio", "Estos son los 3 errores que más vemos cuando alguien pone en venta su propiedad en Lanús. Los tres tienen que ver con el precio. Si querés arrancar bien, escribinos con la dirección: te decimos cuánto vale, sin cargo.", "3 errores al poner el precio"],
  ["B3 · Papeles", "Antes de publicar tu propiedad conviene tener los papeles listos: así la venta no se frena cuando aparece el comprador. En este video te contamos cuáles son. Si querés vender en Lanús, escribinos con la dirección y arrancamos con la tasación sin cargo.", "Qué papeles necesitás para vender"],
  ["C1 · Ya nos conocés", "Ya conocés Caramés. Si estás pensando en vender tu propiedad en Lanús, te hacemos la tasación sin cargo y te decimos cuánto vale hoy. Escribinos con la dirección y coordinamos la visita.", "¿Pensás vender? Tasación sin cargo"],
  ["C2 · Testimonio", "«[frase del cliente]». [Nombre] vendió su [tipo] en [barrio] con Caramés. Si estás pensando en vender la tuya, escribinos con la dirección: te decimos cuánto vale, sin cargo.", "Vendió con Caramés"],
  ["C3 · Story semanal", "Esta semana en Lanús: [tasaciones] tasaciones, [ventas] vendida(s), [visitas] visitas. Si querés saber cuánto vale tu propiedad, escribinos con la dirección.", "Esta semana en Lanús"]
], [1700, 5226, 2100]));
body.push(gap(200));
body.push(note("warn", "Regla de oro",
  "Todas las piezas van al WhatsApp de ventas y todas piden lo mismo: la dirección y el tipo de propiedad. La imagen, el texto del anuncio y el mensaje de bienvenida tienen que decir eso con las mismas palabras. Una pieza que promete otra cosa (vender rápido, mejor precio, comisión) trae gente que no es la que buscamos."));
body.push(gap(200));
body.push(note("info", "Cómo vamos a saber si funcionó",
  "No por el costo por mensaje. Por esto, semana a semana: cuántos propietarios mandaron la dirección, cuántas visitas de tasación se coordinaron y cuántas se hicieron. Se anota en la planilla de tasaciones. Si una pieza trae mensajes pero no direcciones, se cambia la pieza."));

// ============================ build ============================
const doc = new Document({
  creator: "Caramés Lanús Este",
  title: "Brief creativos Meta Ads - Vendedores",
  numbering: { config: [{ reference: "bullets", levels: [
    { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 440, hanging: 260 } }, run: { color: INK3 } } },
    { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 880, hanging: 260 } }, run: { color: INK3 } } }
  ] }] },
  styles: {
    default: { document: { run: { font: "Calibri", size: 20, color: INK2 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: "Calibri", size: 44, bold: true, color: INK } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 30, bold: true, color: INK } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 24, bold: true, color: INK } }
    ]
  },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [run("Brief creativos · Vendedores · Caramés Lanús Este", { size: 15, color: INK3, font: "Consolas" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [run("Página ", { size: 15, color: INK3 }), new TextRun({ children: [PageNumber.CURRENT], size: 15, color: INK3 })] })] }) },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || "Brief creativos - Vendedores - Meta Ads.docx";
  fs.writeFileSync(out, buf);
  console.log("ok", out, buf.length, "bytes");
});
