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

// ============================ document v3 ============================
const body = [];

body.push(new Paragraph({ spacing: { after: 90 },
  children: [run("CARAMÉS LANÚS ESTE   ·   BRIEF PARA COMMUNITY MANAGERS   ·   VERSIÓN 3   ·   12 DE NOVIEMBRE DE 2026",
    { size: 15, bold: true, color: INK3, font: "Consolas" })] }));
body.push(new Paragraph({ spacing: { after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } }, children: [] }));
body.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 200 },
  children: [run("Piezas para Meta Ads — clientes calificados", { size: 44, bold: true, color: INK })] }));
body.push(p("Qué imágenes y videos hay que producir, para qué campaña, con qué medidas y qué fotos, qué texto va dentro de la pieza y qué texto va en el anuncio. Reemplaza a la versión 2 del 30/10: cambia el criterio (ya no buscamos consultas baratas, buscamos gente que venga a ver o que pida tasación) y cambian las fechas.",
  { size: 23, color: INK2, after: 260 }));

body.push(table(null, [
  ["Total de piezas", "31 archivos nuevos (fichas de propiedad, 3 carruseles, 5 videos) + 1 plantilla reutilizable"],
  ["Prioridad 1 (semana del 17 al 21/11)", "A1 vendedores · B0 plantilla 9:16 · B1 fichas de WhatsApp · A2 carrusel vendedores"],
  ["Prioridad 2 (semana del 24 al 28/11)", "C1 PH y departamentos nuevos · C2 carrusel aptas crédito · A3 reel vendedores · D2 reel vendedores educativo"],
  ["Prioridad 3 (semana del 1 al 5/12)", "A5 «Vendidas en tu barrio» · D1 reel compradores educativo · A4 retargeting · E1 reels de alquiler"],
  ["Entrega", "Carpeta de Drive «META · Creativos · 2026-11», una subcarpeta por bloque, nombres según la sección 1"],
  ["Aprueba", "Gonzalo revisa precios, datos de m² y textos antes de subir. Cada pieza que esté lista se sube y se avisa: no esperar al bloque completo"]
], [2600, 6426]));
body.push(gap(220));

body.push(note("stop", "El criterio de este brief: clientes calificados, no consultas",
  "Caramés no necesita más gente que pregunte. Necesita compradores que vengan a ver una propiedad y propietarios que pidan una tasación. Por eso cada pieza tiene que filtrar antes del clic: precio a la vista, barrio exacto, si es apta crédito o no, requisitos cuando los hay, y una acción concreta («escribinos para coordinar una visita», «decinos la dirección y te tasamos»).",
  "Una pieza sin precio o con «consultar» trae el triple de mensajes y casi ninguna visita. Una pieza con el precio y el dato real trae menos mensajes y más visitas. Preferimos lo segundo, aunque cueste más por mensaje."));
body.push(gap(140));
body.push(note("ok", "Empezá por acá",
  [run("La primera entrega es "), b("A1 (vendedores) en 9:16"), run(", para el "), b("lunes 17/11"), run(". Hace cinco semanas que no hay ninguna pieza de vendedores corriendo y la campaña está armada esperando esa imagen. Con esa sola pieza se publica. Después, en orden: B0 plantilla (martes 18), B1 fichas de WhatsApp y A2 carrusel (viernes 21).")],
  [run("Material para arrancar, pedirlo a Gonzalo si no lo tenés: "), b("logo en vector (SVG o PDF) y en PNG con fondo transparente"), run(", "), b("los dos colores de marca en hexadecimal"), run(", "), b("la tipografía de marca"), run(" (si no hay, Montserrat para títulos e Inter para textos), y acceso a la carpeta de Drive de cada propiedad con la ficha técnica y las fotos originales.")]));

// ---------------- SECCIÓN 1 ----------------
body.push(...h1("Sección 1", "Reglas de producción para todas las piezas"));

body.push(...h2("Qué hace que una pieza califique"));
body.push(table(["Elemento", "Cómo va", "Por qué filtra"], [
  ["Precio", "Siempre visible, en USD con punto de miles («USD 65.000»), cuerpo igual o mayor que el titular. En alquileres, en pesos por mes.", "El que ve el precio y escribe igual, puede pagarlo. Sin precio escriben todos."],
  ["Barrio exacto", "«Lanús Este», «Lanús Oeste», «Remedios de Escalada», «Gerli», «Valentín Alsina». Nunca «zona sur» ni «GBA».", "El que busca en Lanús Este no quiere ver Gerli. Ahorra visitas que no van a ningún lado."],
  ["Apta crédito", "Etiqueta sólida «APTA CRÉDITO» solo si la ficha lo marca. Si no lo es, no va nada (nunca «consultar»).", "El 79% de los leads declara presupuesto menor a USD 100.000: muchos compran con crédito y preguntan eso primero."],
  ["Tres datos", "Ambientes · metros totales · patio, cochera o terraza. No más.", "Alcanza para decidir si vale la pena ver; lo demás se cuenta en la visita."],
  ["Acción concreta", "«Escribinos para coordinar una visita» (WhatsApp) · «Dejanos tus datos y te llamamos» (Formulario) · «Decinos la dirección y te tasamos sin cargo» (vendedores).", "Pide lo que queremos que pase, no «más info»."],
  ["Pregunta de filtro en el texto", "Una línea al final del texto del anuncio: «¿Buscás para vivir o para invertir?» (compradores) · «¿Es casa, PH o departamento?» (vendedores).", "El que contesta ya está hablando; el que no, no era."]
], [1700, 4100, 3226]));
body.push(gap(160));

body.push(...h2("Formatos y medidas"));
body.push(table(["Formato", "Medida", "Dónde se usa", "Notas"], [
  ["Cuadrado 1:1", "1080 × 1080 px", "Feed de Facebook e Instagram, carruseles", "Formato base de los carruseles. Siempre entregarlo."],
  ["Vertical 4:5", "1080 × 1350 px", "Feed de Instagram y Facebook", "Ocupa más pantalla que el 1:1. Preferido para imágenes sueltas en feed."],
  ["Vertical 9:16", "1080 × 1920 px", "Stories, Reels, Facebook Reels", "Hoy casi ninguna pieza lo tiene y es donde más se muestra. Obligatorio para todas las fichas nuevas."],
  ["Video", "9:16, MP4, H.264, 30 fps, 15 a 20 s", "Reels y stories", "Subtítulos quemados siempre (la mayoría lo ve sin sonido). Música solo de la biblioteca de Meta o sin música."]
], [1700, 1900, 2500, 2926]));
body.push(gap(160));

body.push(...h2("Fotos: formato y requisitos por tipo de pieza"));
body.push(table(["Pieza", "Fotos necesarias", "Orientación y tamaño mínimo", "Qué tiene que mostrar"], [
  ["Ficha de propiedad (B0, B1, B2, C1)", "3 por propiedad: mejor ambiente vertical, mejor ambiente horizontal, fachada", "Vertical 3000 × 4000 px o más; horizontal 4000 × 3000 o más. JPG original de cámara o celular, no de WhatsApp", "Living o cocina integrada con ventana a la vista, de día, luces prendidas, persianas levantadas. Sin personas, mascotas ni objetos personales"],
  ["Carrusel de propiedades (C2)", "1 por propiedad: la horizontal del mejor ambiente", "Horizontal 4000 × 3000 o más", "Igual que arriba; además patio o terraza si la propiedad lo tiene, porque es lo que decide el clic en PH y casas"],
  ["Vendedores (A1, A2, A5)", "Fachadas de propiedades vendidas por Caramés en Lanús Este (pedir la lista a Gonzalo): 3 a 6 fotos", "Horizontal y vertical, 3000 px de ancho o más", "Calle arbolada, de día, sin autos tapando la entrada, cielo despejado. Nunca una propiedad que esté en venta hoy de otro cliente"],
  ["Retargeting vendedores (A4)", "Fachada de la sucursal, Tucumán 1199 esq. Anatole France", "Horizontal, 3000 px o más", "De día, con el cartel legible, sin gente en la puerta"],
  ["Reels (A3, D1, D2, E1)", "Video vertical grabado con celular en 1080 × 1920, 30 fps", "Tomas de 4 a 6 segundos, cámara quieta o movimiento lento", "Recorrido de ambientes (E1), fachadas vendidas (A3), Diego a cámara (A3, D2) con luz de frente y fondo limpio"]
], [1800, 2400, 2300, 2526]));
body.push(gap(160));

body.push(...h2("Zonas seguras en 9:16"));
body.push(p("Instagram y Facebook superponen la barra de perfil arriba y los botones abajo. Todo texto, precio y logo tiene que quedar dentro del área segura:"));
body.push(bullet([b("Arriba: "), run("250 px libres (el 13% superior). Nada de texto ahí.")]));
body.push(bullet([b("Abajo: "), run("340 px libres (el 18% inferior). Ahí va el botón del anuncio; si ponemos un botón dibujado, va justo por encima de esa franja, nunca adentro.")]));
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
    p("Es el lienzo de 1080 × 1920 visto de frente, a escala. Las dos franjas rojas son las zonas que Instagram y Facebook tapan con su propia interfaz: ahí no va nada. Todo lo que importa (titular, dato, franja, firma, logo) cae entre los 250 y los 1580 px de alto.", { after: 120 }),
    p("Los márgenes laterales son de 60 px: el texto nunca toca el borde.", { after: 120 }),
    p("El mismo esquema vale para la plantilla B0 de propiedades: ahí la foto ocupa de 0 a 1150 px y la franja blanca de datos va de 1150 a 1580.", { after: 120 }),
    p("En 4:5 (1080 × 1350) y 1:1 (1080 × 1080) no hay zonas reservadas tan grandes, pero conviene dejar 60 px libres en los cuatro bordes.", { after: 0 })
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
body.push(bullet([b("Precio: "), run("siempre visible, siempre en USD con punto de miles, cuerpo igual o mayor que el titular. Es el dato que más filtra.")]));
body.push(bullet([b("Sello «APTA CRÉDITO»: "), run("etiqueta sólida (fondo de color de marca, texto blanco, mayúsculas) arriba a la izquierda de la foto, solo si la ficha lo marca.")]));
body.push(bullet([b("Máximo 3 datos: "), run("ambientes, metros totales, cochera o patio. Lo demás va en el texto del anuncio.")]));
body.push(bullet([b("Logo: "), run("abajo a la derecha, 140 px de ancho, sobre fondo que lo deje leer. Nunca en el centro.")]));
body.push(bullet([b("Contraste: "), run("sobre fotos, franja sólida o degradado oscuro al 50% debajo del texto. Texto blanco sobre foto sin franja no se lee.")]));
body.push(bullet([b("No usar: "), run("«Comentá VENDER», «link en bio», «consultar precio», emojis dentro de la imagen, flechas apuntando al botón, texto en rojo.")]));
body.push(gap(120));

body.push(...h2("Especificaciones técnicas de Meta"));
body.push(table(["Tipo", "Requisito", "Recomendación"], [
  ["Imagen", "JPG o PNG · hasta 30 MB · mínimo 1080 px de ancho", "JPG calidad 90, perfil sRGB, sin capas. 1080 × 1920, 1080 × 1350 o 1080 × 1080 exactos."],
  ["Video", "MP4 o MOV · H.264 · hasta 4 GB · relación 9:16 exacta", "1080 × 1920, 30 fps, audio AAC 128 kbps, 15 a 20 s. Primer cuadro con el mensaje principal (es la miniatura)."],
  ["Carrusel", "2 a 10 tarjetas, todas del mismo tamaño", "1080 × 1080 todas; si una queda 1080 × 1350 Meta recorta las demás."],
  ["Texto en imagen", "Ya no hay límite del 20%, pero Meta baja el alcance de imágenes muy cargadas", "Máximo titular + dato + franja. Nada más."],
  ["Contraste", "Legible en pantalla de celular al sol", "Relación mínima 4,5:1 entre texto y fondo (contrast-ratio.com)."],
  ["Versiones", "Meta recorta automáticamente si falta un formato", "Entregar siempre los formatos pedidos; el recorte automático corta el precio o el logo."]
], [1500, 3300, 4226]));
body.push(gap(160));

body.push(...h2("Preguntas frecuentes"));
body.push(table(null, [
  ["¿Puedo usar Canva?", "Sí. Conviene para la plantilla B0: una vez armada, cada propiedad se baja en 10 minutos. Exportar siempre en JPG, calidad alta, tamaño exacto."],
  ["¿Qué tipografía uso?", "La de marca si existe. Si no, Montserrat (títulos y números) e Inter (textos). Nunca más de dos tipografías por pieza."],
  ["¿Puedo cambiar el texto del anuncio?", "El texto dentro de la imagen, dentro de lo que dice cada ficha, sí. El texto principal, titular y botón del anuncio los carga Gonzalo tal como están acá; si tenés una idea mejor, proponela antes de producir."],
  ["¿Y si una propiedad no es apta crédito?", "No va etiqueta. Nunca «consultar» ni «a confirmar» en la imagen."],
  ["¿Qué hago si el dato de m² cambia?", "El valor es de octubre 2026. Si la pieza sale en diciembre o después, pedir el valor nuevo antes de exportar."],
  ["¿Dónde subo las piezas?", "Carpeta de Drive «META · Creativos · 2026-11», una subcarpeta por bloque (A, B, C, D, E). Al subir, avisar por WhatsApp con el código de la pieza."],
  ["¿Puedo entregar una pieza antes que las otras del bloque?", "Sí, y es lo que conviene. Cada pieza que llega se publica sola."]
], [3000, 6026]));
body.push(gap(160));

body.push(...h2("Datos fijos de marca (copiar tal cual)"));
body.push(table(null, [
  ["Razón social", "Caramés Bienes Raíces · Sucursal Lanús Este"],
  ["Dirección", "Tucumán 1199 esq. Anatole France, Lanús Este"],
  ["Teléfono", "4247-4336"],
  ["WhatsApp ventas", "11 6278-2740"],
  ["WhatsApp alquileres", "11 3679-5419"],
  ["Instagram", "@carameslanuseste"],
  ["Web", "www.caramespropiedades.com.ar"],
  ["Tasador", "Diego Gonzalo Caramés · Martillero y Corredor Público · Colegiado N° 216 · CPMCAL"]
], [2600, 6426]));
body.push(gap(160));

body.push(...h2("Nombres de archivo y entrega"));
body.push(p([run("Convención: "), mono("BLOQUE_pieza_formato_vNN.ext"), run(". Ejemplos: "), mono("A_A1a-casa_9x16_v01.jpg"), run(", "), mono("B_pichincha-3020_9x16_v01.jpg"), run(", "), mono("C_carrusel-apto-credito_1x1_tarjeta03_v01.jpg"), run(".")]));
body.push(bullet("JPG calidad 90 para imágenes, MP4 para video. No PNG."));
body.push(bullet("Junto con cada pieza, un archivo de texto con el copy del anuncio (texto principal, titular, descripción, pregunta de filtro) tal como está en el anexo, para copiar y pegar en Ads Manager."));
body.push(bullet("Las piezas con dato de mercado (A1, A2, A3) llevan los valores de octubre 2026 (departamentos USD 1.711/m²; PH USD 725 y casas USD 671/m² sobre superficie total). Anotar el mes del dato en el nombre del archivo."));

// ---------------- BLOQUE A ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque A · Prioridad 1", "Vendedores: «¿Cuánto vale tu propiedad?»"));
body.push(note("stop", "Situación",
  "Hace cinco semanas que no corre ninguna pieza de vendedores. La campaña de WhatsApp está armada y espera la imagen A1. Lo único que hubo fue un retargeting a visitantes de la web que gastó ARS 38.000 para cero resultados, y el video viejo «Verdadero o Falso», que Meta ubica en el 10% de menor interacción.",
  "Un propietario calificado es el que da la dirección y el tipo de propiedad en el primer mensaje. Para eso la pieza tiene que dar algo primero: un dato real (precio por m² del barrio), una oferta concreta (tasación sin cargo en 48 hs) y una firma que dé confianza (martillero colegiado). Audiencia: 35 a 65 años, Lanús y alrededores."));
body.push(gap(120));

body.push(...pieza("A1", "Imagen estática · «¿Cuánto vale tu propiedad en Lanús Este?»",
  "2 variantes (casa/PH y departamento) × 3 formatos = 6 archivos · prioridad 1 · entrega: A1-b departamento 9:16 el lunes 17/11; el resto el viernes 21/11", [
  ["Objetivo", "Que un propietario se detenga en un número real y escriba por WhatsApp con la dirección. Es la pieza principal de la campaña nueva."],
  ["Variantes", [
    [b("A1-a Casa/PH: "), run("fachada de una casa o PH real de Lanús Este, de día, calle arbolada, sin autos tapando. Idealmente una vendida por Caramés.")],
    [b("A1-b Departamento: "), run("living luminoso de un departamento real de la zona, o fachada de edificio de Lanús Este.")]
  ]],
  ["Composición 9:16", [
    "Foto a sangre en los 1920 px, con degradado oscuro del 0% al 60% desde la mitad hacia abajo.",
    "Entre los 300 y 520 px de alto, titular en blanco, 2 líneas, 84 px: «¿Cuánto vale tu propiedad en Lanús Este?»",
    "Entre los 900 y 1150 px, el dato grande, 120 px: «USD 1.711 por m²» en A1-b y «USD 725 por m²» en A1-a (para casa, USD 671). Debajo, 40 px: «Promedio de publicación · Lanús Este · octubre 2026» (en A1-a agregar «sobre superficie total»).",
    "Entre los 1200 y 1360 px, franja sólida de color de marca con texto blanco 56 px: «Tasación sin cargo en 48 hs».",
    "Entre los 1400 y 1520 px, en 32 px gris claro: «Diego G. Caramés · Martillero y Corredor Público · Col. 216 CPMCAL». Logo abajo a la derecha dentro del área segura."
  ]],
  ["Composición 1:1 y 4:5", "Misma jerarquía: foto en los dos tercios superiores, franja sólida inferior con el dato de m² a la izquierda y «Tasación sin cargo en 48 hs» a la derecha. Logo abajo a la derecha."],
  ["Dato de mercado", "Octubre 2026 (planilla VALORES_REFERENCIA_ZONAS, fila Lanús Este, mediana de avisos): departamentos USD 1.711/m²; PH USD 725/m² y casas USD 671/m² sobre superficie total. Nunca redondear hacia arriba. Siempre «promedio de publicación» para que no se lea como tasación."],
  ["Texto principal del anuncio", "¿Tenés una propiedad en Lanús Este y querés saber cuánto vale hoy? Te hacemos la tasación sin cargo y sin compromiso: visitamos, comparamos con lo que se está vendiendo en tu cuadra y en 48 hs tenés el informe firmado por un martillero colegiado. Escribinos por WhatsApp con la dirección y si es casa, PH o departamento, y coordinamos."],
  ["Titular", "Tasación sin cargo en 48 hs"],
  ["Descripción", "Caramés Bienes Raíces · Lanús Este"],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No «vendé rápido», no «mejor precio», no promesas de plazo de venta. No usar fotos de propiedades en venta de otros clientes."]
]));

body.push(...pieza("A2", "Carrusel · «Lo que vale tu propiedad, en 5 tarjetas»",
  "5 tarjetas 1:1 (1080 × 1080) · prioridad 1 · entrega: viernes 21/11", [
  ["Objetivo", "Darle al propietario los datos que busca antes de escribir: cuánto vale, cómo es el proceso, quién lo hace. Va en el mismo conjunto que A1."],
  ["Tarjeta 1 · Gancho", "Fondo sólido de color de marca. Texto blanco 96 px, centrado, 3 líneas: «¿Cuánto vale tu propiedad hoy?». Abajo en 36 px: «Deslizá →». Logo arriba a la izquierda."],
  ["Tarjeta 2 · Dato departamentos", "Foto de edificio o living de Lanús Este con franja inferior. «Departamentos en Lanús Este» (48 px) · «USD 1.711/m²» (120 px) · «promedio de publicación · octubre 2026» (32 px)."],
  ["Tarjeta 3 · Dato casas y PH", "Misma estructura con fachada de casa. «Casas y PH en Lanús Este» · «PH USD 725/m² · Casas USD 671/m²» · «sobre superficie total · promedio de publicación · octubre 2026»."],
  ["Tarjeta 4 · Cómo funciona", "Fondo claro, tres pasos en columna con número grande: «1 · Nos escribís con la dirección» / «2 · Visitamos tu propiedad (30 minutos)» / «3 · En 48 hs recibís el informe firmado». Debajo: «Sin cargo. Sin compromiso.»"],
  ["Tarjeta 5 · Confianza + CTA", "Collage de 3 fachadas de propiedades vendidas por Caramés con el sello «VENDIDA» en diagonal y el barrio debajo, sin precios. Franja inferior: «Diego G. Caramés · Martillero Col. 216 CPMCAL» y «Escribinos por WhatsApp». Logo."],
  ["Texto principal del anuncio", "Antes de decidir, conocé el valor real de tu propiedad. Estos son los valores promedio de publicación en Lanús Este este mes. Si querés saber cuánto vale la tuya, escribinos con la dirección: te hacemos la tasación sin cargo en 48 hs."],
  ["Titulares por tarjeta", ["T1: ¿Cuánto vale tu propiedad?", "T2: Departamentos · USD 1.711/m²", "T3: Casas y PH · USD 725 y 671/m²", "T4: Así trabajamos", "T5: Tasación sin cargo"]],
  ["Botón", "Enviar mensaje de WhatsApp (en las 5 tarjetas)"],
  ["Qué evitar", "No mezclar tipografías entre tarjetas. No más de dos colores de marca. No poner el precio de cierre de las vendidas."]
]));

body.push(...pieza("A3", "Reel 15 s · «Lo que vale tu casa en Lanús Este»",
  "1 video 9:16, 15 segundos, con subtítulos · prioridad 2 · entrega: viernes 28/11 (guion aprobado antes de grabar)", [
  ["Objetivo", "Mismo mensaje que A1 en video, para Reels. Reemplaza al reel «¿Querés vender?» que no funcionó."],
  ["Segundos 0 a 2", "Pantalla con el número grande (USD 1.711/m², departamentos) y voz o texto: «Esto vale hoy el metro en Lanús Este». Sin logo, sin intro."],
  ["Segundos 2 a 6", "Tres fachadas de propiedades vendidas por Caramés, 1,3 s cada una, con «VENDIDA · [barrio]» en 64 px. Zoom suave."],
  ["Segundos 6 a 11", "Diego a cámara (o voz en off sobre plano de una visita de tasación): «Si tenés una propiedad en Lanús, te decimos cuánto vale. Sin cargo, sin compromiso, en 48 horas. Mandanos la dirección.»"],
  ["Segundos 11 a 15", "Pantalla final: «Tasación sin cargo en 48 hs» (84 px) · «Escribinos por WhatsApp con la dirección» (48 px) · «Diego G. Caramés · Martillero Col. 216» (32 px) · logo. 4 segundos completos."],
  ["Subtítulos", "Quemados, blancos con borde negro, 56 px, centrados entre los 1300 y 1500 px de alto. Nunca en los 340 px inferiores."],
  ["Audio", "Voz clara sin música, o instrumental de la biblioteca de Meta a volumen bajo."],
  ["Texto principal del anuncio", "Mismo que A1."],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("A4", "Imagen de retargeting · «Ya nos conocés»",
  "1 imagen × 2 formatos (4:5 y 9:16) · prioridad 3 · entrega: viernes 5/12", [
  ["Objetivo", "Para quienes ya interactuaron con la página o el perfil. Recordatorio corto con la misma oferta. (No se usa para visitantes de la web hasta que se arregle el píxel.)"],
  ["Composición", "Fachada de la sucursal (Tucumán 1199 esq. Anatole France), de día. Franja sólida inferior con «¿Pensás vender? Tasación sin cargo en 48 hs» y el WhatsApp de ventas escrito: «11 6278-2740». Logo."],
  ["Texto principal del anuncio", "Ya conocés Caramés. Si estás pensando en vender tu propiedad en Lanús, te hacemos la tasación sin cargo y te decimos cuánto vale hoy. Escribinos con la dirección y coordinamos la visita."],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("A5", "Imagen · «Vendidas en tu barrio» (prueba social)",
  "1 imagen × 3 formatos · prioridad 3 · entrega: viernes 5/12", [
  ["Objetivo", "El propietario que duda quiere saber si Caramés vende de verdad en su barrio. Esta pieza lo muestra sin hablar de precios."],
  ["Composición", "Collage de 4 fachadas de propiedades vendidas por Caramés en los últimos meses, cada una con sello «VENDIDA» y el barrio («Lanús Este», «Remedios de Escalada»). Titular en franja superior: «4 propiedades vendidas en Lanús este mes». Franja inferior: «La tuya puede ser la próxima · Tasación sin cargo en 48 hs». Logo."],
  ["Qué pedir a Gonzalo", "Lista de 4 a 6 propiedades vendidas recientes con autorización del dueño para mostrar la fachada, y el mes de venta."],
  ["Texto principal del anuncio", "Estas propiedades se vendieron en Lanús con Caramés. Si estás pensando en vender la tuya, escribinos con la dirección: te decimos cuánto vale hoy, sin cargo y sin compromiso."],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No poner precios de cierre ni tiempos de venta exactos. No usar propiedades de otras inmobiliarias."]
]));

// ---------------- BLOQUE B ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque B · Prioridad 1", "Compradores WhatsApp: plantilla 9:16 y fichas que filtran"));
body.push(note("warn", "Situación",
  "La campaña de WhatsApp trae entre 50 y 60 conversaciones por semana, pero muchas son «¿precio?» de gente que después no viene. Las piezas actuales son cuadradas, sin precio visible en varias, y en vertical se ven mal. Hace falta (1) una plantilla 9:16 con precio y datos a la vista para todas las propiedades, y (2) 3 o 4 propiedades nuevas por conjunto para que Meta rote."));
body.push(gap(120));

body.push(...pieza("B0", "Plantilla reutilizable · ficha de propiedad en 9:16",
  "1 plantilla editable (Canva, Figma o PSD) · prioridad 1 · entrega: martes 18/11", [
  ["Objetivo", "Que cualquier propiedad se baje a 9:16 en 10 minutos con la misma estructura. Es la pieza más importante del brief: se usa en B, C y E."],
  ["Estructura", [
    "Píxeles 0 a 1150: foto principal horizontal del mejor ambiente, centrada, a sangre a los lados. Sobre la foto, arriba a la izquierda a 280 px de alto, etiqueta sólida «APTA CRÉDITO» si corresponde (48 px, mayúsculas).",
    "Píxeles 1150 a 1580: franja sólida blanca (o del color claro de marca). Dentro, en orden: tipo y barrio en 44 px gris («PH · Lanús Este») / precio en 112 px negro («USD 65.000») / tres datos en 40 px con íconos simples («3 amb · 56 m² · entrada independiente») / dirección sin altura ni piso en 36 px gris («Córdoba al 1500»).",
    "Píxeles 1480 a 1560: botón dibujado del color de marca, texto blanco 44 px «Escribinos para coordinar una visita» (en Formulario: «Dejanos tus datos»). Queda justo por encima de la franja reservada de 340 px.",
    "Logo a 100 px de ancho, abajo a la derecha de la franja blanca."
  ]],
  ["Versión 4:5", "Misma estructura: foto en los 900 px superiores, franja de datos en los 450 inferiores."],
  ["Reglas", "Un solo precio por pieza. Sin etiqueta si no es apta crédito. Nunca más de 3 datos. La foto siempre del ambiente que vende, no de la fachada si la fachada es fea."],
  ["Qué evitar", "No collage de 4 fotos en una pieza. No dirección exacta con altura y piso."]
]));

body.push(...pieza("B1", "Bajar a 9:16 las propiedades activas de WhatsApp",
  "9 imágenes 9:16 con la plantilla B0 · prioridad 1 · entrega: viernes 21/11 (Pichincha 3020 primero)", [
  ["Propiedades", [
    "Pichincha 3020 (la que más conversaciones trae: primero esta)",
    "Udaondo 1233 (Meta la califica «calidad por debajo del promedio»: foto nueva obligatoria)",
    "Gaebeler 1025",
    "Eva Perón 3241 · Depto 2",
    "Alvarado 2910",
    "Ramón Cabrero 1848",
    "Las Piedras 1843",
    "25 de Mayo 837 · 4C",
    "Arredondo 25"
  ]],
  ["Fuente de datos", "Ficha técnica de cada propiedad en Drive y el documento «redes» que genera el publicador. Precio, ambientes, metros y «apta crédito» salen de ahí, no de memoria."],
  ["Texto principal del anuncio", "Documento «redes» de cada propiedad (primer párrafo + precio + «apta crédito» si corresponde). Cerrar siempre con: «Escribinos por WhatsApp para coordinar una visita. ¿Buscás para vivir o para invertir?»"],
  ["Titular", "[Tipo] en [barrio] · USD [precio]"],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("B2", "Propiedades nuevas para rotar",
  "3 propiedades nuevas por conjunto (casas, PH, departamentos) = 9 fichas en 9:16 + 4:5 · prioridad 1 · entrega: a medida que entren, no más de 2 días después de la ficha", [
  ["Objetivo", "Que cada conjunto tenga 4 o 5 propiedades vivas. Hoy departamentos no tiene ninguna que funcione: el conjunto DEPTO 1 lleva una semana con 2 conversaciones."],
  ["Criterio de elección", "Aptas crédito primero. Precio entre USD 50.000 y USD 120.000. Con foto principal buena: si la foto es mala, no entra hasta que haya fotos nuevas."],
  ["Formato", "Plantilla B0 en 9:16 y 4:5 para cada una. Nombrar con la calle, sin altura ni piso."],
  ["Regla de reemplazo", "Cuando una propiedad se reserva o se vende, avisar el mismo día para pausar el anuncio. Cada día que sigue corriendo son visitas que no se pueden hacer."]
]));

// ---------------- BLOQUE C ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque C · Prioridad 2", "Compradores Formulario: departamentos y PH nuevos, carrusel apto crédito"));
body.push(note("ok", "Situación",
  "Es la campaña que más formularios trae (46 a 70 por semana) y el formulario ya pregunta presupuesto y si tiene propiedad para vender: filtra solo. Lo que falta es stock: el conjunto de departamentos trajo 1 formulario en la última semana con ARS 9.400 gastados, y el de PH depende de Sarmiento 1524, que ya se cansó. Casas sigue bien con Ayacucho 2470 y Guido 1419."));
body.push(gap(120));

body.push(...pieza("C1", "Tres PH y tres departamentos nuevos",
  "6 fichas en 1:1, 4:5 y 9:16 con la plantilla B0 = 18 archivos · prioridad 2 · entrega: viernes 28/11", [
  ["Objetivo", "Reemplazar a Sarmiento 1524 en PH y darle algo que mostrar al conjunto de departamentos, que hoy está vacío de propiedades que funcionen."],
  ["Criterio PH", "Entrada independiente, aptos crédito, entre USD 60.000 y USD 110.000, con patio o terraza visible en la foto principal."],
  ["Criterio departamentos", "2 o 3 ambientes, aptos crédito, entre USD 50.000 y USD 90.000, luminosos, en Lanús Este o Remedios de Escalada. Balcón visible si lo tiene."],
  ["Botón", "Más información (lleva al formulario instantáneo)"],
  ["Texto principal", "Documento «redes» de cada propiedad. Cerrar con «Dejanos tus datos y te llamamos para coordinar una visita.»"]
]));

body.push(...pieza("C2", "Carrusel · «5 propiedades aptas crédito en Lanús Este»",
  "6 tarjetas 1:1 (5 propiedades + 1 cierre) · prioridad 2 · entrega: viernes 28/11", [
  ["Objetivo", "Una pieza que muestra 5 propiedades y deja que cada persona elija la suya. Reparte la frecuencia entre 5 inmuebles."],
  ["Tarjetas 1 a 5", "Una propiedad por tarjeta con la estructura de la plantilla B0 en 1:1: foto en los 700 px superiores, franja inferior con tipo y barrio, precio en 96 px, 3 datos, etiqueta «APTA CRÉDITO». Una casa, dos PH y dos departamentos, todos aptos crédito, de distinto rango de precio."],
  ["Tarjeta 6 · Cierre", "Fondo de color de marca: «¿Ninguna es la tuya? Tenemos más en Lanús Este.» (72 px) · «Dejanos tus datos y te mostramos las que encajan con tu búsqueda» (40 px) · logo."],
  ["Texto principal del anuncio", "5 propiedades en Lanús Este que podés comprar con crédito hipotecario. Deslizá, elegí la que te gusta y dejanos tus datos: te llamamos para coordinar una visita."],
  ["Titular por tarjeta", "[Tipo] · [barrio] · USD [precio]"],
  ["Botón", "Más información"],
  ["Mantenimiento", "Cuando una de las 5 se vende, se reemplaza la tarjeta, no se baja el carrusel."]
]));

// ---------------- BLOQUE D ----------------
body.push(...h1("Bloque D · Prioridad 2 y 3", "Contenido educativo: para que te recuerden como quien explica"));
body.push(note("warn", "Situación",
  "La campaña de reconocimiento hoy muestra videos de listados a público frío; Meta los ubica en el 10% de menor interacción. Las piezas educativas anteriores tenían buena retención (28% llegaba al 25% del video) pero no pedían nada al final. Estas dos reemplazan al «Verdadero o Falso» y a los listados en reconocimiento."));
body.push(gap(120));

body.push(...pieza("D2", "Reel 20 s · «¿Cuánto tarda en venderse una casa en Lanús?»",
  "1 video 9:16, 20 segundos, subtítulos · prioridad 2 · entrega: viernes 28/11 (guion aprobado antes de grabar)", [
  ["Objetivo", "Reemplaza al «Verdadero o Falso» en el conjunto de reconocimiento de vendedores. Público frío de Lanús: que conozcan a Caramés por un dato útil, no por un acertijo."],
  ["Segundos 0 a 2", "Texto grande sobre fondo oscuro: «¿Cuánto tarda en venderse una casa en Lanús?». Voz: «Te lo decimos con números». Sin logo."],
  ["Segundos 2 a 8", "Diego a cámara: el tiempo típico de venta en la zona cuando el precio está bien puesto, y qué pasa cuando está 15% arriba (pedirle a Gonzalo los dos datos reales antes de grabar)."],
  ["Segundos 8 a 14", "Tres cosas que aceleran la venta: precio de publicación real, fotos profesionales, publicación en todos los portales. Texto 64 px por cada una sobre planos de fachadas vendidas."],
  ["Segundos 14 a 20", "Cierre: «Si querés saber cuánto vale la tuya, escribinos con la dirección» · «Tasación sin cargo en 48 hs» · logo. 4 segundos completos."],
  ["Texto principal del anuncio", "¿Cuánto tarda en venderse una casa en Lanús? Depende de una sola cosa: el precio de publicación. En este video te contamos lo que vemos todos los meses. Si querés saber cuánto vale la tuya, escribinos."],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("D1", "Reel 20 s · «3 errores al comprar en Lanús Este»",
  "1 video 9:16, 20 segundos, subtítulos · prioridad 3 · entrega: viernes 5/12", [
  ["Objetivo", "Para el conjunto de refuerzo (gente que ya interactuó) y el de reconocimiento de compradores. Que vean a Caramés como quien ayuda a comprar bien."],
  ["Segundos 0 a 2", "Texto grande sobre fondo oscuro: «El error N° 1 al comprar en Lanús» con voz: «Este es el error que más vemos». Sin logo."],
  ["Segundos 2 a 8", "Error 1: «Comprar sin ver el estado del edificio». Plano de un frente de edificio y del pasillo. Texto 64 px arriba."],
  ["Segundos 8 a 13", "Error 2: «No preguntar si es apta crédito antes de enamorarte». Plano de una escritura o de la etiqueta APTA CRÉDITO."],
  ["Segundos 13 a 17", "Error 3: «Ir a ver propiedades sin saber cuánto podés pagar por mes». Plano de una calculadora o planilla."],
  ["Segundos 17 a 20", "Cierre: «Te ayudamos a comprar bien en Lanús Este» · «Escribinos y contanos qué buscás» · logo. 3 segundos completos."],
  ["Texto principal del anuncio", "Estos son los 3 errores que más vemos cuando alguien compra su primera propiedad en Lanús. Si estás buscando, escribinos: te decimos qué propiedades encajan con tu presupuesto y cuáles son aptas crédito. ¿Buscás para vivir o para invertir?"],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

// ---------------- BLOQUE E ----------------
body.push(...h1("Bloque E · Prioridad 3", "Alquileres en Instagram: renovar los reels"));
body.push(note("ok", "Situación",
  "Los carruseles nuevos del 10/11 sostuvieron el conjunto de alquileres. «Reels 1» tiene seis semanas y bajó de 500 a 700 visitas por día a menos de 400. Hacen falta reels nuevos cada 15 días."));
body.push(gap(120));

body.push(...pieza("E1", "Dos reels de alquiler por mes",
  "2 videos 9:16, 12 a 15 segundos, con la estética de «Reels 1» · prioridad 3 · entrega: el primero el viernes 5/12, después uno cada 15 días", [
  ["Estructura", "Recorrido rápido de la propiedad (3 a 4 ambientes, 3 s cada uno), precio del alquiler en pesos visible desde el segundo 1 en 96 px, «requisitos: garantía propietaria + seguro de caución» en 44 px en el último plano, cierre con «Escribinos por WhatsApp · 11 3679-5419»."],
  ["Criterio", "Departamentos de 2 ambientes en Lanús Este, con precio dentro del promedio de la zona. Los que mejor funcionan muestran el precio y los requisitos sin rodeos: así escribe el que cumple."],
  ["Botón", "Ver perfil de Instagram (el conjunto optimiza visitas al perfil; el lead llega por mensaje directo)"]
]));

// ---------------- CALENDARIO ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Calendario y checklist", "Qué entregar cada semana"));
body.push(table(["Semana", "Piezas", "Archivos", "Quién revisa"], [
  ["Semana 1 (lunes 17 al viernes 21/11)", "Lunes 17: A1-b depto 9:16 · Martes 18: B0 plantilla · Viernes 21: resto de A1, A2 carrusel, B1 las 9 de WhatsApp", "1 plantilla + 6 + 5 + 9 = 21 archivos + copys", "Gonzalo: precios y dato de m²"],
  ["Semana 2 (24 al 28/11)", "A3 reel vendedores · D2 reel educativo vendedores · C1 tres PH y tres departamentos · C2 carrusel apto crédito · B2 primeras propiedades nuevas", "2 videos + 18 + 6 + 6 = 32 archivos + copys", "Gonzalo: guiones antes de grabar"],
  ["Semana 3 (1 al 5/12)", "A5 vendidas en tu barrio · D1 reel educativo compradores · A4 retargeting · E1 primer reel de alquiler · B2 resto", "1 video + 3 + 2 + 1 video + 12 = 19 archivos + copys", "Gonzalo"],
  ["Continuo", "B2 cada propiedad nueva dentro de los 2 días de la ficha · E1 cada 15 días · aviso el mismo día de cada reserva o venta", "", ""]
], [2000, 3626, 2000, 1400]));
body.push(gap(200));

body.push(...h2("Antes de entregar cada pieza, verificar"));
body.push(bullet("El precio está en la imagen y coincide con la ficha técnica de Drive y con el documento «redes»."));
body.push(bullet("El barrio está escrito exacto. «APTA CRÉDITO» solo si la ficha lo marca."));
body.push(bullet("Ningún texto cae en los 250 px de arriba ni en los 340 px de abajo (9:16)."));
body.push(bullet("El titular se lee en un celular a un brazo de distancia."));
body.push(bullet("El dato de m² dice «promedio de publicación» y el mes."));
body.push(bullet("El botón dibujado dice lo mismo que el botón del anuncio (WhatsApp en WhatsApp, «Dejanos tus datos» en Formulario)."));
body.push(bullet("El texto del anuncio termina con la pregunta de filtro."));
body.push(bullet("No hay fotos de banco, emojis en la imagen, «consultar» ni «Comentá VENDER»."));
body.push(bullet("El archivo se llama según la convención y está en la subcarpeta del bloque."));
body.push(gap(160));

body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Anexo", "Textos de los anuncios, listos para copiar"));
body.push(p("Cada pieza se entrega con un archivo de texto con estas líneas, para que quien carga en Ads Manager copie y pegue sin reescribir.", { after: 200 }));
body.push(table(["Pieza", "Texto principal", "Titular", "Botón"], [
  ["A1 · Vendedores imagen", "¿Tenés una propiedad en Lanús Este y querés saber cuánto vale hoy? Te hacemos la tasación sin cargo y sin compromiso: visitamos, comparamos con lo que se está vendiendo en tu cuadra y en 48 hs tenés el informe firmado por un martillero colegiado. Escribinos por WhatsApp con la dirección y si es casa, PH o departamento, y coordinamos.", "Tasación sin cargo en 48 hs", "Enviar mensaje de WhatsApp"],
  ["A2 · Vendedores carrusel", "Antes de decidir, conocé el valor real de tu propiedad. Estos son los valores promedio de publicación en Lanús Este este mes. Si querés saber cuánto vale la tuya, escribinos con la dirección: te hacemos la tasación sin cargo en 48 hs.", "T1 ¿Cuánto vale tu propiedad? · T2 Departamentos · USD 1.711/m² · T3 Casas y PH · USD 725 y 671/m² · T4 Así trabajamos · T5 Tasación sin cargo", "Enviar mensaje de WhatsApp"],
  ["A3 · Vendedores reel", "Mismo texto que A1.", "Tasación sin cargo en 48 hs", "Enviar mensaje de WhatsApp"],
  ["A4 · Retargeting vendedores", "Ya conocés Caramés. Si estás pensando en vender tu propiedad en Lanús, te hacemos la tasación sin cargo y te decimos cuánto vale hoy. Escribinos con la dirección y coordinamos la visita.", "¿Pensás vender? Tasación sin cargo", "Enviar mensaje de WhatsApp"],
  ["A5 · Vendidas en tu barrio", "Estas propiedades se vendieron en Lanús con Caramés. Si estás pensando en vender la tuya, escribinos con la dirección: te decimos cuánto vale hoy, sin cargo y sin compromiso.", "Vendidas en Lanús este mes", "Enviar mensaje de WhatsApp"],
  ["B1 / B2 · Propiedades WhatsApp", "Documento «redes» de cada propiedad (primer párrafo + precio + «apta crédito» si corresponde). Cerrar con: «Escribinos por WhatsApp para coordinar una visita. ¿Buscás para vivir o para invertir?»", "[Tipo] en [barrio] · USD [precio]", "Enviar mensaje de WhatsApp"],
  ["C1 · PH y deptos Formulario", "Documento «redes» de cada propiedad. Cerrar con: «Dejanos tus datos y te llamamos para coordinar una visita.»", "[Tipo] en [barrio] · USD [precio]", "Más información"],
  ["C2 · Carrusel aptas crédito", "5 propiedades en Lanús Este que podés comprar con crédito hipotecario. Deslizá, elegí la que te gusta y dejanos tus datos: te llamamos para coordinar una visita.", "[Tipo] · [barrio] · USD [precio] (una por tarjeta) · T6 ¿Ninguna es la tuya?", "Más información"],
  ["D2 · Reel vendedores educativo", "¿Cuánto tarda en venderse una casa en Lanús? Depende de una sola cosa: el precio de publicación. En este video te contamos lo que vemos todos los meses. Si querés saber cuánto vale la tuya, escribinos.", "¿Cuánto tarda en venderse una casa en Lanús?", "Enviar mensaje de WhatsApp"],
  ["D1 · Reel compradores educativo", "Estos son los 3 errores que más vemos cuando alguien compra su primera propiedad en Lanús. Si estás buscando, escribinos: te decimos qué propiedades encajan con tu presupuesto y cuáles son aptas crédito. ¿Buscás para vivir o para invertir?", "3 errores al comprar en Lanús", "Enviar mensaje de WhatsApp"],
  ["E1 · Reels alquiler", "Documento «redes» de la propiedad, con precio del alquiler en pesos y requisitos. Cerrar con: «Escribinos por WhatsApp al 11 3679-5419.»", "[Ambientes] en [barrio] · $[precio]/mes", "Ver perfil de Instagram"]
], [1500, 3826, 2100, 1600]));
body.push(gap(200));
body.push(note("warn", "Regla de oro para los textos",
  "El botón dibujado en la imagen tiene que decir lo mismo que el botón del anuncio. Si la campaña va a WhatsApp, la imagen dice «Escribinos por WhatsApp»; si va a formulario, dice «Dejanos tus datos». Y el texto del anuncio siempre termina pidiendo algo concreto: la dirección, o si busca para vivir o invertir."));
body.push(gap(200));
body.push(note("info", "Cómo vamos a saber si funcionó",
  "No por el costo por mensaje. Por esto: A1/A2/A3/D2: cantidad de propietarios que mandan dirección y aceptan visita de tasación por semana. B0/B1/B2/C1/C2: cantidad de visitas a propiedades coordinadas por semana desde Meta (se anota en la planilla). D1: que la gente que ya interactuó escriba contando qué busca. E1: consultas de alquiler que cumplen requisitos. Si una pieza trae mensajes pero no visitas, se cambia la pieza."));

// ============================ build ============================
const doc = new Document({
  creator: "Caramés Lanús Este",
  title: "Brief creativos Meta Ads v3 - clientes calificados",
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
      children: [run("Brief creativos v3 · Meta Ads · Caramés Lanús Este", { size: 15, color: INK3, font: "Consolas" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [run("Página ", { size: 15, color: INK3 }), new TextRun({ children: [PageNumber.CURRENT], size: 15, color: INK3 })] })] }) },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || "Brief creativos v3 - Meta Ads - clientes calificados.docx";
  fs.writeFileSync(out, buf);
  console.log("ok", out, buf.length, "bytes");
});
