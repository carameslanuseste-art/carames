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

// ============================ document ============================
const body = [];

body.push(new Paragraph({ spacing: { after: 90 },
  children: [run("CARAMÉS LANÚS ESTE   ·   BRIEF PARA COMMUNITY MANAGERS   ·   29 DE OCTUBRE DE 2026",
    { size: 15, bold: true, color: INK3, font: "Consolas" })] }));
body.push(new Paragraph({ spacing: { after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } }, children: [] }));
body.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 200 },
  children: [run("Piezas a producir para Meta Ads — noviembre 2026", { size: 44, bold: true, color: INK })] }));
body.push(p("Qué imágenes y videos hay que crear, para qué campaña, con qué medidas, qué texto va dentro de la pieza y qué texto va en el anuncio. Cada pieza sale de un dato concreto de la cuenta: el motivo está al lado de cada bloque.",
  { size: 23, color: INK2, after: 260 }));

body.push(table(null, [
  ["Total de piezas", "28 piezas nuevas (22 imágenes y fichas de propiedad, 2 carruseles, 4 videos) + 1 plantilla reutilizable para propiedades"],
  ["Prioridad 1 (esta semana)", "Bloque A · Vendedores (A1, A2) y Bloque B · plantilla 9:16 de propiedades"],
  ["Prioridad 2 (semana 2)", "A3 (reel vendedores), Bloque C · reemplazos de PH y carrusel apto crédito"],
  ["Prioridad 3 (semana 3)", "Bloque D · reel educativo de retargeting, Bloque E · reels de alquiler"],
  ["Entrega", "Carpeta de Drive «META · Creativos · 2026-11», un subcarpeta por bloque, nombres según la convención de la sección 1"],
  ["Aprueba", "Gonzalo revisa texto y precios antes de subir a Ads Manager; nada sale sin precio y dato de mercado verificados"]
], [2600, 6426]));
body.push(gap(220));

body.push(note("info", "Por qué este brief",
  "Los anuncios de propiedades funcionan: Meta los califica por encima del promedio y traen leads de comprador a unos $1.250. Lo que no funciona hoy es (1) la campaña de vendedores, que gastó $72.000 para 5 formularios porque pide una acción distinta a la que optimiza y no ofrece nada concreto; (2) la campaña de WhatsApp, que muestra las mismas 7 propiedades a las mismas 17.000 personas 4,4 veces en un mes y no tiene versión vertical; (3) el conjunto PH 1, que se cansó después de $300.000 en un solo PH; y (4) los videos de reconocimiento, que Meta ubica en el 10% de menor interacción porque son listados disfrazados de contenido."));

// ---------------- SECCIÓN 1: reglas ----------------
body.push(...h1("Sección 1", "Reglas de producción para todas las piezas"));

body.push(...h2("Formatos y medidas"));
body.push(table(["Formato", "Medida", "Dónde se usa", "Notas"], [
  ["Cuadrado 1:1", "1080 × 1080 px", "Feed de Facebook e Instagram, carruseles", "Es el formato base de los carruseles. Siempre entregarlo."],
  ["Vertical 4:5", "1080 × 1350 px", "Feed de Instagram y Facebook", "Ocupa más pantalla que el 1:1 en el feed. Preferido para imágenes sueltas."],
  ["Vertical 9:16", "1080 × 1920 px", "Stories, Reels, Facebook Reels", "Es donde más gasta la cuenta (Instagram stories, $124.000 al mes en Formulario). Hoy casi ninguna pieza lo tiene."],
  ["Video", "9:16, MP4, H.264, 30 fps, 15 a 20 s", "Reels y stories", "Subtítulos quemados siempre (el 70% lo ve sin sonido). Música solo de la biblioteca de Meta o sin música."]
], [1700, 1900, 2500, 2926]));
body.push(gap(160));

body.push(...h2("Zonas seguras en 9:16"));
body.push(p("Instagram y Facebook superponen la barra de perfil arriba y los botones abajo. Todo texto, precio y logo tiene que quedar dentro del área segura:"));
body.push(bullet([b("Arriba: "), run("250 px libres (el 13% superior). Nada de texto ahí.")]));
body.push(bullet([b("Abajo: "), run("340 px libres (el 18% inferior). Ahí va el botón del anuncio; si ponemos un «CTA» dibujado, que quede justo por encima de esa franja, nunca adentro.")]));
body.push(bullet([b("Laterales: "), run("60 px de margen a cada lado.")]));
body.push(bullet([b("Área útil real: "), run("1080 × 1330 px, entre los píxeles 250 y 1580 de alto.")]));
body.push(gap(120));

body.push(...h2("Texto dentro de la imagen"));
body.push(bullet([b("Titular: "), run("máximo 2 líneas, 6 a 8 palabras, cuerpo mínimo 72 px en 9:16 y 64 px en 1:1. Se tiene que leer en un celular sin hacer zoom.")]));
body.push(bullet([b("Precio: "), run("siempre visible, siempre en USD con punto de miles («USD 65.000»), cuerpo igual o mayor que el titular. Es el dato que más decide el clic.")]));
body.push(bullet([b("Sello «APTA CRÉDITO»: "), run("si la propiedad lo es, va como etiqueta sólida (fondo de color de marca, texto blanco, mayúsculas) arriba a la izquierda de la foto. Es el gancho que mejor funcionó en los textos actuales.")]));
body.push(bullet([b("Máximo 3 datos: "), run("ambientes, metros totales, cochera o patio. No más. Lo demás va en el texto del anuncio.")]));
body.push(bullet([b("Logo: "), run("abajo a la derecha, 140 px de ancho, sobre fondo que lo deje leer. Nunca en el centro.")]));
body.push(bullet([b("Contraste: "), run("sobre fotos, usar una franja sólida o un degradado oscuro al 50% debajo del texto. Texto blanco sobre foto sin franja no se lee.")]));
body.push(bullet([b("No usar: "), run("«Comentá VENDER», «link en bio», emojis dentro de la imagen, flechas apuntando al botón, texto en rojo (lo asocian a rebaja).")]));
body.push(gap(120));

body.push(...h2("Fotos"));
body.push(bullet("Solo fotos propias de la propiedad o de calles de Lanús Este. Nada de bancos de imágenes: se nota y Meta lo penaliza en calidad."));
body.push(bullet("Horizontal, iluminada de día, sin personas, sin objetos personales a la vista. Para 9:16, pedir al fotógrafo también una toma vertical del mejor ambiente; recortar una horizontal a 9:16 deja la foto sin contexto."));
body.push(bullet("Para 25 de Mayo 837 - 4C (Meta la califica «calidad por debajo del promedio»): volver a fotografiar o cambiar la foto principal antes de volver a subirla."));
body.push(gap(120));

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
body.push(bullet("JPG calidad 90 para imágenes, MP4 para video. No PNG (pesa el triple y no cambia nada)."));
body.push(bullet("Junto con cada pieza, un archivo de texto con el copy del anuncio (texto principal, titular, descripción) tal como está en este brief, para que quien carga en Ads Manager copie y pegue."));
body.push(bullet("Las piezas con dato de mercado (A1, A2, A3) se entregan con el número tomado de la planilla «VALORES_REFERENCIA_ZONAS» (Drive, carpeta 11 Tasaciones/_SISTEMA), fila Lanús Este, mes vigente. Anotar en el nombre del archivo el mes del dato. Si el mes cambia, se rehace la pieza."));

// ---------------- BLOQUE A ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque A · Prioridad 1", "Vendedores: «¿Cuánto vale tu propiedad?»"));
body.push(note("stop", "Qué pasó y qué cambia",
  "La campaña actual de vendedores gastó $72.326 en dos semanas para 5 formularios ($14.465 cada uno). El reel genérico «¿Querés vender?» no dice cuánto vale nada, el texto pide «Comentá VENDER» pero la campaña optimiza formularios, y «Verdadero o Falso» no generó ningún resultado. Se pausa y se rehace con objetivo conversaciones de WhatsApp.",
  "La nueva campaña necesita piezas que den un dato concreto (precio por m² del barrio), una oferta concreta (tasación sin cargo en 48 hs) y una firma que dé confianza (martillero colegiado). Audiencia: 35 a 65 años, dueños de casa, PH o departamento en Lanús y alrededores."));
body.push(gap(120));

body.push(...pieza("A1", "Imagen estática · «¿Cuánto vale tu propiedad en Lanús Este?»",
  "2 variantes (casa y departamento) × 3 formatos = 6 archivos · prioridad 1 · entrega: viernes de esta semana", [
  ["Objetivo", "Que un propietario se detenga en un número y escriba por WhatsApp. Es la pieza principal de la campaña nueva."],
  ["Variantes", [
    [b("A1-a Casa/PH: "), run("foto de fachada de una casa o PH real de Lanús Este, de día, calle arbolada, sin autos tapando. Idealmente una propiedad vendida por Caramés.")],
    [b("A1-b Departamento: "), run("foto de living luminoso de un departamento real de la zona, o fachada de edificio de Lanús Este.")]
  ]],
  ["Composición 9:16", [
    "Foto a sangre en los 1920 px, con degradado oscuro del 0% al 60% desde la mitad hacia abajo.",
    "Entre los 300 y 520 px de alto, titular en blanco, 2 líneas, 84 px: «¿Cuánto vale tu propiedad en Lanús Este?»",
    "Entre los 900 y 1150 px, el dato grande, 120 px, blanco con un tono de marca: «USD [___] por m²» y debajo, 40 px: «Promedio de publicación · Lanús Este · [mes] 2026».",
    "Entre los 1200 y 1360 px, franja sólida de color de marca con texto blanco 56 px: «Tasación sin cargo en 48 hs».",
    "Entre los 1400 y 1520 px, en 32 px gris claro: «Diego G. Caramés · Martillero y Corredor Público · Col. 216 CPMCAL». Logo abajo a la derecha dentro del área segura."
  ]],
  ["Composición 1:1 y 4:5", "Misma jerarquía, foto ocupa los dos tercios superiores, franja sólida inferior con el dato de m² a la izquierda y «Tasación sin cargo en 48 hs» a la derecha. Logo abajo a la derecha."],
  ["Dato de mercado", "Tomar de «VALORES_REFERENCIA_ZONAS», fila Lanús Este: «Depto USD/m²» para A1-b, «Casa/PH USD/m²» para A1-a. Nunca inventarlo ni redondearlo hacia arriba. Agregar siempre «promedio de publicación» para que no se lea como tasación."],
  ["Texto principal del anuncio", "¿Tenés una propiedad en Lanús Este y querés saber cuánto vale hoy? Te hacemos la tasación sin cargo y sin compromiso: visitamos, comparamos con lo que se está vendiendo en tu cuadra y en 48 hs tenés el informe firmado por un martillero colegiado. Escribinos por WhatsApp y coordinamos."],
  ["Titular", "Tasación sin cargo en 48 hs"],
  ["Descripción", "Caramés Bienes Raíces · Lanús Este"],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Qué evitar", "No poner «vendé rápido», «mejor precio» ni promesas de plazo de venta. No usar fotos de propiedades que todavía están en venta de otros clientes."]
]));

body.push(...pieza("A2", "Carrusel · «Lo que vale tu propiedad, en 5 tarjetas»",
  "5 tarjetas 1:1 (1080 × 1080) · prioridad 1 · entrega: viernes de esta semana", [
  ["Objetivo", "Darle al propietario los datos que busca antes de escribir: cuánto vale, cómo es el proceso, quién lo hace. Va en el mismo conjunto que A1 para que Meta elija."],
  ["Tarjeta 1 · Gancho", "Fondo sólido de color de marca. Texto blanco 96 px, centrado, 3 líneas: «¿Cuánto vale tu propiedad hoy?». Abajo en 36 px: «Deslizá →». Logo arriba a la izquierda."],
  ["Tarjeta 2 · Dato departamentos", "Foto de edificio o living de Lanús Este con franja inferior. Texto: «Departamentos en Lanús Este» (48 px) · «USD [___]/m²» (120 px) · «promedio de publicación · [mes] 2026» (32 px)."],
  ["Tarjeta 3 · Dato casas y PH", "Misma estructura con fachada de casa. Texto: «Casas y PH en Lanús Este» · «USD [___]/m²» · «sobre superficie total · [mes] 2026»."],
  ["Tarjeta 4 · Cómo funciona", "Fondo claro, tres pasos en columna con número grande a la izquierda: «1 · Nos escribís por WhatsApp» / «2 · Visitamos tu propiedad (30 minutos)» / «3 · En 48 hs recibís el informe firmado». Debajo: «Sin cargo. Sin compromiso.»"],
  ["Tarjeta 5 · Confianza + CTA", "Collage de 3 fotos de propiedades vendidas por Caramés con el sello «VENDIDA» en diagonal y el barrio debajo (sin precios). Franja inferior: «Diego G. Caramés · Martillero Col. 216 CPMCAL» y «Escribinos por WhatsApp». Logo."],
  ["Texto principal del anuncio", "Antes de decidir, conocé el valor real de tu propiedad. Estos son los valores promedio de publicación en Lanús Este este mes. Si querés saber cuánto vale la tuya, te hacemos la tasación sin cargo en 48 hs."],
  ["Titulares por tarjeta", ["T1: ¿Cuánto vale tu propiedad?", "T2: Departamentos · USD [___]/m²", "T3: Casas y PH · USD [___]/m²", "T4: Así trabajamos", "T5: Tasación sin cargo"]],
  ["Botón", "Enviar mensaje de WhatsApp (en las 5 tarjetas)"],
  ["Qué evitar", "No mezclar tipografías entre tarjetas. No usar más de dos colores de marca. No poner el precio de cierre de las propiedades vendidas."]
]));

body.push(...pieza("A3", "Reel 15 s · «Lo que vale tu casa en Lanús Este»",
  "1 video 9:16, 15 segundos, con subtítulos · prioridad 2 · entrega: semana 2", [
  ["Objetivo", "Mismo mensaje que A1 en video para Reels. Reemplaza al reel «¿Querés vender?» que no funcionó."],
  ["Segundos 0 a 2", "Pantalla con el número grande (USD [___]/m²) y voz o texto: «Esto vale hoy el metro en Lanús Este». Sin logo, sin intro. Si en 2 segundos no hay número, se van."],
  ["Segundos 2 a 6", "Tres fachadas de propiedades vendidas por Caramés, 1,3 s cada una, con «VENDIDA · [barrio]» en texto 64 px. Movimiento suave de zoom."],
  ["Segundos 6 a 11", "Diego a cámara (o voz en off sobre plano de una visita de tasación): «Si tenés una propiedad en Lanús, te decimos cuánto vale. Sin cargo, sin compromiso, en 48 horas.»"],
  ["Segundos 11 a 15", "Pantalla final: «Tasación sin cargo en 48 hs» (84 px) · «Escribinos por WhatsApp» (48 px) · «Diego G. Caramés · Martillero Col. 216» (32 px) · logo. Mantener 4 segundos completos."],
  ["Subtítulos", "Quemados, blancos con borde negro, 56 px, centrados entre los 1300 y 1500 px de alto. Nunca en la franja inferior de 340 px."],
  ["Audio", "Voz clara sin música, o música instrumental de la biblioteca de Meta a volumen bajo. Nada con derechos."],
  ["Texto principal del anuncio", "Mismo que A1."],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

body.push(...pieza("A4", "Imagen de retargeting · «Ya nos conocés»",
  "1 imagen × 2 formatos (4:5 y 9:16) · prioridad 3 · entrega: semana 3", [
  ["Objetivo", "Para el conjunto de quienes ya interactuaron con la página o el perfil. Recordatorio corto con la misma oferta."],
  ["Composición", "Foto de la fachada de la sucursal (Tucumán 1199 esq. Anatole France), de día. Franja sólida inferior con «¿Pensás vender? Tasación sin cargo en 48 hs» y el WhatsApp de ventas escrito: «11 6278-2740». Logo."],
  ["Texto principal del anuncio", "Ya conocés Caramés. Si estás pensando en vender tu propiedad en Lanús, te hacemos la tasación sin cargo y te decimos cuánto vale hoy. Escribinos y coordinamos la visita."],
  ["Botón", "Enviar mensaje de WhatsApp"]
]));

// ---------------- BLOQUE B ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque B · Prioridad 1", "Compradores WhatsApp: plantilla 9:16 y propiedades nuevas"));
body.push(note("warn", "Qué pasó y qué cambia",
  "La campaña de WhatsApp le mostró las mismas 7 propiedades a 17.000 personas 4,4 veces en un mes. El costo por conversación subió de $409 a $633. Facebook feed convierte a $446 y las stories de Instagram a $823: las piezas están pensadas para feed cuadrado y en vertical se ven mal. Hace falta (1) una plantilla 9:16 para todas las propiedades y (2) 3 o 4 propiedades nuevas por conjunto para que Meta rote."));
body.push(gap(120));

body.push(...pieza("B0", "Plantilla reutilizable · ficha de propiedad en 9:16",
  "1 plantilla editable (Canva, Figma o PSD) · prioridad 1 · entrega: miércoles de esta semana", [
  ["Objetivo", "Que cualquier propiedad se pueda bajar a 9:16 en 10 minutos con la misma estructura. Es la pieza más importante del brief porque se usa en los bloques B, C y E."],
  ["Estructura", [
    "Píxeles 0 a 1150: foto principal horizontal del mejor ambiente, centrada, a sangre a los lados. Sobre la foto, arriba a la izquierda a 280 px de alto, etiqueta sólida «APTA CRÉDITO» si corresponde (48 px, mayúsculas).",
    "Píxeles 1150 a 1580: franja sólida blanca (o del color claro de marca). Dentro, en orden: tipo y barrio en 44 px gris («PH · Lanús Este») / precio en 112 px negro («USD 65.000») / tres datos en 40 px con íconos simples («3 amb · 56 m² · entrada independiente») / dirección sin número de piso en 36 px gris («Córdoba al 1500»).",
    "Píxeles 1480 a 1560: botón dibujado del color de marca, texto blanco 44 px «Escribinos por WhatsApp» (en Formulario: «Pedí más info»). Queda justo por encima de la franja reservada de 340 px.",
    "Logo a 100 px de ancho, abajo a la derecha de la franja blanca."
  ]],
  ["Versión 4:5", "Misma estructura: foto en los 900 px superiores, franja de datos en los 450 inferiores."],
  ["Reglas", "Un solo precio por pieza. Si la propiedad no es apta crédito, no va etiqueta (no poner «consultar»). Nunca más de 3 datos. La foto siempre del ambiente que vende, no de la fachada si la fachada es fea."],
  ["Qué evitar", "No usar collage de 4 fotos en una pieza: baja el clic. No escribir la dirección exacta con altura y piso."]
]));

body.push(...pieza("B1", "Bajar a 9:16 las 7 propiedades activas de WhatsApp",
  "7 imágenes 9:16 con la plantilla B0 · prioridad 1 · entrega: viernes de esta semana", [
  ["Propiedades", [
    "Pichincha 3020 (la mejor de la campaña: 188 conversaciones a $432, primero esta)",
    "Gaebeler 1025",
    "Eva Perón 3241 · Depto 2",
    "Udaondo 1233",
    "Ramón Cabrero 1848",
    "Las Piedras 1843",
    "Alvarado 2910"
  ]],
  ["Fuente de datos", "Ficha técnica de cada propiedad en Drive y el documento «redes» que genera el publicador. Precio, ambientes, metros y «apta crédito» salen de ahí, no de memoria."],
  ["Texto principal del anuncio", "Usar el documento «redes» de cada propiedad (primer párrafo + precio + «apta crédito» si corresponde). Cerrar siempre con: «Escribinos por WhatsApp y coordinamos una visita.»"],
  ["Titular", "[Tipo] en [barrio] · USD [precio]"],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["No rehacer", "25 de Mayo 837 - 4C y Arredondo 25 se pausan. Si se quieren volver a subir, primero fotos nuevas."]
]));

body.push(...pieza("B2", "Propiedades nuevas para rotar",
  "3 propiedades nuevas por conjunto (casas, PH, departamentos) = 9 fichas en 9:16 + 4:5 · prioridad 1 · entrega: a medida que entren, no más de 2 días después de la ficha", [
  ["Objetivo", "Que cada conjunto tenga 4 o 5 propiedades vivas. Con menos de 3, Meta repite la misma y la frecuencia sube."],
  ["Criterio de elección", "Aptas crédito primero (es el gancho que mejor rinde). Precio entre USD 50.000 y USD 120.000 (el 79% de los leads de Meta declara presupuesto por debajo de USD 100.000). Con foto principal buena: si la foto es mala, no entra hasta que haya fotos nuevas."],
  ["Formato", "Plantilla B0 en 9:16 y 4:5 para cada una. Nombrar con la calle, sin número de piso."],
  ["Regla de reemplazo", "Cuando una propiedad se reserva o se vende, avisar el mismo día para pausar el anuncio. Cada día que sigue corriendo es plata perdida y leads que no se pueden atender."]
]));

// ---------------- BLOQUE C ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Bloque C · Prioridad 2", "Compradores Formulario: reemplazos de PH y carrusel apto crédito"));
body.push(note("ok", "Qué pasó y qué cambia",
  "Es la campaña que mejor funciona: 902 formularios a $1.241 y costo estable. Pero el conjunto PH 1 se cansó: $300.000 en Sarmiento 1524, frecuencia 2,88, conversión 62% más baja que hace un mes. Guido 1419 (casa) sigue bien. Hace falta renovar PH y sumar un carrusel que muestre varias propiedades a la vez para repartir la frecuencia."));
body.push(gap(120));

body.push(...pieza("C1", "Tres PH nuevos para el conjunto PH 1",
  "3 fichas en 1:1, 4:5 y 9:16 con la plantilla B0 = 9 archivos · prioridad 2 · entrega: semana 2", [
  ["Objetivo", "Reemplazar a Sarmiento 1524 antes de que el costo por lead del conjunto se vaya arriba de $1.500."],
  ["Criterio", "PH con entrada independiente, aptos crédito, entre USD 60.000 y USD 110.000, con patio o terraza visible en la foto principal. Córdoba 1572 ya está cargado y puede ser uno de los tres."],
  ["Botón", "Más información (lleva al formulario instantáneo)"],
  ["Texto principal", "Documento «redes» de cada propiedad. Cerrar con «Dejanos tus datos y te llamamos para coordinar una visita.»"]
]));

body.push(...pieza("C2", "Carrusel · «5 propiedades aptas crédito en Lanús Este»",
  "6 tarjetas 1:1 (5 propiedades + 1 cierre) · prioridad 2 · entrega: semana 2", [
  ["Objetivo", "Una sola pieza que muestra 5 propiedades y deja que cada persona elija la suya. Reparte la frecuencia entre 5 inmuebles en lugar de concentrarla en uno."],
  ["Tarjetas 1 a 5", "Una propiedad por tarjeta con la estructura de la plantilla B0 en 1:1: foto en los 700 px superiores, franja inferior con tipo y barrio, precio en 96 px, 3 datos, etiqueta «APTA CRÉDITO». Elegir una casa, dos PH y dos departamentos, todos aptos crédito, de distinto rango de precio."],
  ["Tarjeta 6 · Cierre", "Fondo de color de marca: «¿Ninguna es la tuya? Tenemos más en Lanús Este.» (72 px) · «Dejanos tus datos y te mostramos las que encajan con tu búsqueda» (40 px) · logo."],
  ["Texto principal del anuncio", "5 propiedades en Lanús Este que podés comprar con crédito hipotecario. Deslizá, elegí la que te gusta y dejanos tus datos: te llamamos para coordinar una visita."],
  ["Titular por tarjeta", "[Tipo] · [barrio] · USD [precio]"],
  ["Botón", "Más información"],
  ["Mantenimiento", "Cuando una de las 5 se vende, se reemplaza la tarjeta, no se baja el carrusel entero."]
]));

// ---------------- BLOQUE D ----------------
body.push(...h1("Bloque D · Prioridad 3", "Retargeting: un reel educativo que sí despierte interés"));
body.push(note("warn", "Qué pasó y qué cambia",
  "De la campaña de reconocimiento se conserva solo el conjunto «Refuerzo – Ya interactuaron». Los videos de listados que corrían ahí están en el 10% de menor interacción. Las dos piezas educativas («5 cosas a revisar», «Cosas a tener en cuenta») tenían el formato correcto pero CTR de 0,07% a 0,12%: les faltó gancho en los primeros 2 segundos."));
body.push(gap(120));

body.push(...pieza("D1", "Reel 20 s · «3 errores al comprar en Lanús Este»",
  "1 video 9:16, 20 segundos, subtítulos · prioridad 3 · entrega: semana 3", [
  ["Segundos 0 a 2", "Texto grande sobre fondo oscuro: «El error N° 1 al comprar en Lanús» con voz: «Este es el error que más vemos». Sin logo, sin saludo."],
  ["Segundos 2 a 8", "Error 1: «Comprar sin ver el estado del edificio». Plano de un frente de edificio y una toma del pasillo. Texto 64 px arriba."],
  ["Segundos 8 a 13", "Error 2: «No preguntar si es apta crédito antes de enamorarte». Plano de una escritura o de la etiqueta APTA CRÉDITO."],
  ["Segundos 13 a 17", "Error 3: «Ir a ver propiedades sin saber cuánto podés pagar por mes». Plano de una calculadora o planilla."],
  ["Segundos 17 a 20", "Cierre: «Te ayudamos a comprar bien en Lanús Este» · «Escribinos» · logo. 3 segundos completos."],
  ["Texto principal del anuncio", "Estos son los 3 errores que más vemos cuando alguien compra su primera propiedad en Lanús. Si estás buscando, escribinos: te decimos qué propiedades encajan con tu presupuesto y cuáles son aptas crédito."],
  ["Botón", "Enviar mensaje de WhatsApp"],
  ["Regla", "Si en 7 días el CTR no supera 1%, se baja. No se insiste con reconocimiento que no interesa."]
]));

// ---------------- BLOQUE E ----------------
body.push(...h1("Bloque E · Prioridad 3", "Alquileres en Instagram: seguir con lo que funciona"));
body.push(note("ok", "Qué pasó",
  "El conjunto Alquileres - IG trajo 126 leads a $1.155 con el CPM más bajo de la cuenta. El anuncio «Reels 1» generó 105 de esos leads solo. Acá no hay nada que arreglar: hay que producir más de lo mismo para que no se canse."));
body.push(gap(120));

body.push(...pieza("E1", "Dos reels de alquiler por mes",
  "2 videos 9:16, 12 a 15 segundos, con la estética de «Reels 1» · prioridad 3 · entrega: uno cada 15 días", [
  ["Estructura", "Recorrido rápido de la propiedad (3 a 4 ambientes, 3 s cada uno), precio del alquiler en pesos visible desde el segundo 1 en 96 px, «requisitos: garantía + seguro» en texto 44 px en el último plano, cierre con «Escribinos por WhatsApp · 11 3679-5419»."],
  ["Criterio", "Departamentos de 2 ambientes en Lanús Este, con precio dentro del promedio de la zona. Los que más consultas generan son los que muestran el precio sin rodeos."],
  ["Botón", "Ver perfil de Instagram (el conjunto optimiza visitas al perfil; el lead llega por mensaje directo)"]
]));

// ---------------- CALENDARIO ----------------
body.push(new Paragraph({ children: [new PageBreak()] }));
body.push(...h1("Calendario y checklist", "Qué entregar cada semana"));
body.push(table(["Semana", "Piezas", "Cantidad de archivos", "Quién revisa"], [
  ["Semana 1 (hasta el 2/11)", "B0 plantilla · A1 (a y b, 3 formatos) · A2 carrusel · B1 las 7 de WhatsApp", "1 plantilla + 6 + 5 + 7 = 18 archivos + 2 copys", "Gonzalo: precios y dato de m²"],
  ["Semana 2 (hasta el 9/11)", "A3 reel vendedores · C1 tres PH · C2 carrusel apto crédito · B2 primeras 3 propiedades nuevas", "1 video + 9 + 6 + 6 = 22 archivos + copys", "Gonzalo: guion del reel antes de grabar"],
  ["Semana 3 (hasta el 16/11)", "D1 reel educativo · A4 retargeting · E1 primer reel de alquiler · B2 resto", "2 videos + 2 + 12 = 16 archivos + copys", "Gonzalo"],
  ["Continuo", "B2 cada propiedad nueva dentro de los 2 días de la ficha · E1 cada 15 días · aviso el mismo día de cada reserva o venta", "", ""]
], [2000, 3626, 2000, 1400]));
body.push(gap(200));

body.push(...h2("Antes de entregar cada pieza, verificar"));
body.push(bullet("El precio coincide con la ficha técnica de Drive y con el documento «redes» de la propiedad."));
body.push(bullet("«APTA CRÉDITO» solo aparece si la ficha lo marca."));
body.push(bullet("Ningún texto cae en los 250 px de arriba ni en los 340 px de abajo (9:16)."));
body.push(bullet("El titular se lee en un celular a un brazo de distancia."));
body.push(bullet("El dato de m² dice «promedio de publicación» y el mes."));
body.push(bullet("El botón dibujado dice lo mismo que el botón del anuncio (WhatsApp en WhatsApp, «Más información» en Formulario)."));
body.push(bullet("No hay fotos de banco, emojis en la imagen ni «Comentá VENDER»."));
body.push(bullet("El archivo se llama según la convención y está en la subcarpeta del bloque."));
body.push(gap(160));

body.push(note("info", "Cómo vamos a saber si funcionó",
  "A1/A2/A3: costo por conversación de la campaña de vendedores por debajo de $3.000 en los primeros 7 días. B0/B1/B2: frecuencia de WhatsApp por debajo de 3,0 y costo por conversación de vuelta a $450 o menos. C1/C2: costo por formulario del conjunto PH 1 de vuelta a $1.250. D1: CTR mayor a 1%. Si una pieza no llega, se cambia la pieza, no el presupuesto."));

// ============================ build ============================
const doc = new Document({
  creator: "Caramés Lanús Este",
  title: "Brief creativos Meta Ads - noviembre 2026",
  numbering: {
    config: [{
      reference: "bullets",
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 440, hanging: 260 } }, run: { color: INK3 } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 880, hanging: 260 } }, run: { color: INK3 } } }
      ]
    }]
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 20, color: INK2 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", run: { font: "Calibri", size: 44, bold: true, color: INK } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 30, bold: true, color: INK } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Calibri", size: 24, bold: true, color: INK } }
    ]
  },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [run("Brief creativos · Meta Ads · Caramés Lanús Este", { size: 15, color: INK3, font: "Consolas" })]
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [run("Página ", { size: 15, color: INK3 }), new TextRun({ children: [PageNumber.CURRENT], size: 15, color: INK3 })]
    })] }) },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = process.argv[2] || "Brief creativos - Meta Ads - Nov 2026.docx";
  fs.writeFileSync(out, buf);
  console.log("ok", out, buf.length, "bytes");
});
