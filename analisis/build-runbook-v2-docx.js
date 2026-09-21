const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  Header, Footer, PageNumber, HeightRule, VerticalAlign
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

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 276 },
  indent: opts.indent,
  alignment: opts.alignment,
  children: Array.isArray(text) ? text : [new TextRun({
    text, size: opts.size ?? 20, color: opts.color ?? INK2, bold: opts.bold, italics: opts.italics
  })]
});

const run = (text, o = {}) => new TextRun({
  text, size: o.size ?? 20, color: o.color ?? INK2, bold: o.bold, italics: o.italics, font: o.font
});

// ---- step: real drawn tick-box (a bordered 1x1 table), font-independent ----
const BOX = 300; // DXA, ~5.3 mm

function tickBox() {
  const edge = { style: BorderStyle.SINGLE, size: 8, color: "8C9AA6" };
  return new Table({
    width: { size: BOX, type: WidthType.DXA },
    columnWidths: [BOX],
    borders: { top: edge, bottom: edge, left: edge, right: edge, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({
      height: { value: BOX, rule: HeightRule.EXACT },
      children: [new TableCell({
        width: { size: BOX, type: WidthType.DXA },
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        children: [new Paragraph({ spacing: { after: 0, line: 200 }, children: [run("", { size: 12 })] })]
      })]
    })]
  });
}

function step(n, title, ...bodies) {
  const right = [new Paragraph({
    spacing: { after: 60, line: 276 },
    children: [
      run(n + ". ", { size: 20, bold: true, color: INK3 }),
      run(title, { size: 21, bold: true, color: INK })
    ]
  })];
  bodies.forEach((b, i) => right.push(new Paragraph({
    spacing: { after: i === bodies.length - 1 ? 0 : 90, line: 276 },
    children: Array.isArray(b) ? b : [run(b)]
  })));

  const cell = (kids, w) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: noBorders,
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 60, bottom: 60, left: 0, right: 0 },
    children: kids
  });

  return [
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: [620, W - 620],
      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
      rows: [new TableRow({ children: [cell([tickBox()], 620), cell(right, W - 620)] })]
    }),
    new Paragraph({ spacing: { after: 100 }, children: [] })
  ];
}

// ---- coloured note block ----
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

// ---- data table ----
function table(headers, rows, widths) {
  const mk = (text, o = {}) => new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.head ? { type: ShadingType.CLEAR, fill: "EDF1F5", color: "auto" } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: cellBorders,
    children: [new Paragraph({
      spacing: { after: 0, line: 264 },
      children: [run(text, {
        size: o.head ? 15 : 19,
        bold: o.head || o.first,
        color: o.head ? INK3 : (o.first ? INK : INK2),
        font: o.mono ? "Consolas" : undefined
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
        children: r.map((c, i) => mk(String(c), { w: widths[i], first: i === 0, mono: /^SEG \//.test(String(c)) }))
      }))
    ]
  });
}

function phase(tag, title, mins) {
  return [
    new Paragraph({
      spacing: { before: 460, after: 0 },
      children: [run(tag.toUpperCase() + "   ·   " + mins, { size: 15, bold: true, color: INK3, font: "Consolas" })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 60, after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK } },
      children: [run(title, { size: 30, bold: true, color: INK })]
    })
  ];
}

const gap = (h = 200) => new Paragraph({ spacing: { after: h }, children: [] });

// ============================ document ============================
const body = [];

body.push(new Paragraph({ spacing: { after: 90 },
  children: [run("CARAMÉS LANÚS ESTE   ·   RUNBOOK v2   ·   21 DE SEPTIEMBRE DE 2026",
    { size: 15, bold: true, color: INK3, font: "Consolas" })] }));
body.push(new Paragraph({ spacing: { after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } }, children: [] }));
body.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 200 },
  children: [run("Campaña de interacción — plan de corrección", { size: 48, bold: true, color: INK })] }));
body.push(p("Seis fases para bajar el costo por seguidor de $962 a la zona de $650–750. Tildá cada casillero a medida que avanzás.",
  { size: 23, color: INK2, after: 260 }));

body.push(table(null, [
  ["Dónde", "Administrador de anuncios · cuenta «Caramés Bienes Raices - Sucursal Lanús Este»"],
  ["Qué vas a tocar", "Campaña de interacción · hoy en $15.000 diarios"],
  ["Cuánto lleva", "50 a 60 minutos, más el tiempo de editar los videos nuevos"],
  ["Punto de partida", "$962 por seguidor atribuido · $1.075 por seguidor neto real"]
], [2400, 6626]));
body.push(gap(220));

body.push(note("warn", "Antes de arrancar",
  "No empieces un viernes. Los conjuntos nuevos entran en fase de aprendizaje y los primeros tres días son los más ruidosos: conviene que puedas mirarlos.",
  "Y anotá el número de seguidores que tiene hoy tu Instagram (27.715 al 21/09). Es contra ese número que vas a medir de verdad, no contra lo que informa Meta."));

// ---------------- FASE 1 ----------------
body.push(...phase("Fase 1", "Bajar el presupuesto diario", "2 min"));
body.push(p("Es el cambio que más devuelve y el más rápido. A $10.000 diarios el seguidor salía $670; a los $15.000 de hoy sale $1.083.", { after: 180 }));
body.push(...step(1, "Cambiá el presupuesto de la campaña a $10.000",
  [run("Campañas → tildá "), run("Campaña de interacción", { bold: true, color: INK }), run(" → "),
   run("Editar", { bold: true, color: INK }), run(". Cambiá el presupuesto diario de $15.000 a "),
   run("$10.000", { bold: true, color: INK }), run(" y publicá.")],
  "Si hacés solo este paso y ningún otro, ya mejorás. Te libera unos $150.000 por mes."));

// ---------------- FASE 2 ----------------
body.push(...phase("Fase 2", "Apagar el presupuesto de campaña", "10 min"));
body.push(p("Sin esto, los conjuntos de la fase 3 no sirven: Meta vuelve a mandar toda la plata a Reels. En los últimos 30 días le dio el 85,4% del presupuesto a Reels, que es la ubicación más cara por seguidor.", { after: 180 }));
body.push(...step(2, "Desactivá el presupuesto Advantage de campaña",
  [run("En la misma pantalla de edición, buscá "), run("Presupuesto de campaña Advantage", { bold: true, color: INK }),
   run(" —en cuentas más viejas aparece como "), run("Optimización del presupuesto de la campaña", { bold: true, color: INK }),
   run(" o CBO— y apagalo.")]));
body.push(...step(3, "Verificá que se haya guardado",
  [run("En la lista de campañas, la columna "), run("Presupuesto", { bold: true, color: INK }),
   run(" tiene que decir "), run("Usar presupuesto del conjunto de anuncios", { bold: true, color: INK }),
   run(". Si sigue mostrando un monto, no se aplicó.")]));
body.push(gap(140));
body.push(note("stop", "Si no te deja apagarlo",
  "En algunas cuentas Meta bloquea el interruptor en campañas ya creadas. Si te pasa: duplicá la campaña y en el duplicado dejá el presupuesto Advantage apagado desde el arranque. Armá los conjuntos ahí y pausá la original recién cuando la nueva esté gastando."));

// ---------------- FASE 3 ----------------
body.push(...phase("Fase 3", "Tres conjuntos, uno por ubicación", "25 min"));
body.push(p("Hoy Reels se lleva el 85,4% del presupuesto a $1.259 por seguidor, mientras Stories ($361) y Feed ($306) se reparten el 11%. Separarlos es lo que corrige esa distorsión.", { after: 120 }));
body.push(p([run("Atajo: duplicá dos veces el conjunto "), run("SEG / IG - ALQUILER", { bold: true, color: INK }),
  run(". Así heredás la geo y las exclusiones, que ya están bien.")], { after: 200 }));

body.push(table(["Conjunto", "Nombre a poner", "Presupuesto diario", "Única ubicación tildada"], [
  ["A", "SEG / Reels", "$4.000", "Instagram · Reels"],
  ["B", "SEG / Stories", "$3.500", "Instagram · Historias"],
  ["C", "SEG / Feed", "$2.500", "Instagram · Feed"]
], [1100, 2500, 2200, 3226]));
body.push(gap(160));

body.push(...step(4, "Duplicá el conjunto base dos veces y renombrá los tres",
  "Usá los nombres de la tabla. Vas a terminar con tres conjuntos nuevos más los dos viejos, que por ahora dejás corriendo."));
body.push(...step(5, "Cargá el presupuesto de cada uno",
  "$4.000, $3.500 y $2.500. Suman los $10.000 de la fase 1."));
body.push(...step(6, "Pasá las ubicaciones a manuales",
  [run("En "), run("Ubicaciones", { bold: true, color: INK }), run(", cambiá de "),
   run("Ubicaciones Advantage+", { bold: true, color: INK }), run(" a "),
   run("Ubicaciones manuales", { bold: true, color: INK }),
   run(". Destildá todo y dejá una sola por conjunto, según la tabla.")]));
body.push(...step(7, "Destildá Facebook, Messenger y Audience Network en los tres",
  "Facebook consumió $13.146 en el último mes y devolvió 12 seguidores. Sacarlo es gratis y mejora el promedio solo."));
body.push(...step(8, "Bajá la edad a 18–54",
  "Hoy está en 18–65. Las franjas mayores tienen el CTR más alto y la conversión más baja de toda la campaña: es toque accidental."));
body.push(...step(9, "Dejá la ubicación geográfica como está",
  [run("Lanús + 17 km. "), run("No la amplíes", { bold: true, color: INK }),
   run(": ese radio ya cubre holgadamente Avellaneda, Banfield, Escalada y Lomas de Zamora, que es toda tu zona de trabajo. Ampliarlo te traería gente de zonas donde no operás.")]));
body.push(...step(10, "Confirmá que siguen las exclusiones",
  [run("En cada conjunto tienen que figurar "), run("Seguidores de instagram", { bold: true, color: INK, font: "Consolas" }),
   run(" y "), run("Seguidores de facebook", { bold: true, color: INK, font: "Consolas" }),
   run(" como audiencias excluidas. Al duplicar se heredan, pero verificalo.")]));
body.push(...step(11, "Publicá y esperá a que los tres gasten",
  [run("Recién cuando veas gasto real en los tres, pausá "), run("SEG / IG - ALQUILER", { bold: true, color: INK }),
   run(" y "), run("SEG / IG - VENTAS", { bold: true, color: INK }), run(". No antes, o te quedás sin nada corriendo.")]));
body.push(gap(140));
body.push(note("ok", "Antes de publicar",
  [run("Repasá que cada conjunto tenga "), run("una sola", { bold: true, color: INK }),
   run(" ubicación tildada y su propio presupuesto. Si alguno quedó con dos, Meta vuelve a concentrar el gasto y perdés el sentido del ejercicio.")]));

// ---------------- FASE 4 ----------------
body.push(...phase("Fase 4", "Limpiar los anuncios", "15 min"));
body.push(p("Los tres anuncios que más gastan hoy son los tres más caros. Entre ellos se llevan casi $208.000 al mes.", { after: 180 }));

body.push(table(["Anuncio", "Gasto 30 días", "$ / seguidor", "Qué hacer"], [
  ["Blanco Encalada 2396", "$119.718", "$1.015", "Pausar"],
  ["9 de Julio 2217", "$71.371", "$1.065", "Pausar"],
  ["Tucumán 1259 - 3A", "$16.437", "$1.264", "Pausar"],
  ["Joaquín V. González 2793", "$43.702", "$753", "Mantener"],
  ["Riobamba 107", "$6.579", "$286", "Reactivar si la propiedad sigue"]
], [2800, 1900, 1700, 2626]));
body.push(gap(160));

body.push(...step(12, "Pausá los tres anuncios caros",
  "Pausalos, no los borres: el historial sirve para comparar después."));
body.push(...step(13, "Dejá tres anuncios corriendo en cada conjunto",
  "Con menos de tres no hay rotación y todo el peso cae en una sola pieza, que es exactamente lo que viene pasando desde julio."));
body.push(...step(14, "Cambiá qué mostrás en el primer cuadro",
  [run("Dejá de abrir con la fachada. Abrí con "), run("el mejor ambiente de adentro, con luz natural", { bold: true, color: INK }),
   run(".")],
  "Los tres anuncios caros tienen entre 0,91% y 1,28% de reproducción completa. Riobamba y Sarmiento, los más baratos, llegan a 2,14% y 3,69%. Ahí está la diferencia."));

// ---------------- FASE 5 ----------------
body.push(...phase("Fase 5", "Refrescar el creativo", "3 semanas"));
body.push(p("Contra el desgaste de audiencia, lo que corresponde no es ampliar la zona sino cambiar la fórmula del anuncio. Venís con la misma desde abril: foto o video de fachada con el cartel de ALQUILER encima. Tu audiencia ya la vio decenas de veces.", { after: 180 }));
body.push(...step(15, "Semana 1 — Recorrido por el interior",
  "Video caminando por la propiedad, sin cartel en el primer cuadro. Que se vea el espacio antes que el precio."));
body.push(...step(16, "Semana 2 — Vos a cámara",
  "Contando algo de la zona o del mercado. No una propiedad: una opinión o un dato. Es lo que hace que alguien siga una cuenta."));
body.push(...step(17, "Semana 3 — Un dato de barrio o un antes/después",
  "Contenido que sirva aunque la persona no esté buscando propiedad ahora."));
body.push(gap(140));
body.push(note("info", null,
  "Medí cada formato por costo por seguidor, no por likes. La idea es encontrar cuál de los tres merece repetirse."));

// ---------------- FASE 6 ----------------
body.push(...phase("Fase 6", "Medir bien", "10 min + semanal"));
body.push(...step(18, "Agregá la columna de seguidores al informe",
  [run("En "), run("Columnas → Personalizar columnas", { bold: true, color: INK }), run(", agregá "),
   run("Seguidores nuevos en Instagram", { bold: true, color: INK }), run(" junto a "),
   run("Importe gastado", { bold: true, color: INK }), run(". Guardá la vista como preajuste.")],
  "Mientras mires «costo por resultado», estás viendo visitas al perfil y no seguidores. Eso es lo que ocultó el problema dos meses."));
body.push(...step(19, "Anotá el conteo real de seguidores cada lunes",
  [run("Meta se atribuye un 12% más de seguidores de los que la cuenta gana de verdad: en las últimas 4 semanas informó 421 mientras Instagram subió de 27.338 a 27.715, o sea "),
   run("377 reales", { bold: true, color: INK }),
   run(". La diferencia es gente que sigue y después deja de seguir. El número de la cuenta es el que manda.")]));
body.push(...step(20, "Aplicá la regla de corte por anuncio",
  [run("Cualquier anuncio que después de 7 días y $15.000 gastados esté arriba de "),
   run("$600 por seguidor", { bold: true, color: INK }), run(", se pausa. Sin excepción.")]));
body.push(...step(21, "No toques nada durante 14 días",
  "Los conjuntos están en aprendizaje y cada cambio lo reinicia. Los primeros tres días vas a ver números feos: es normal. La primera lectura seria es a los 7 días."));

body.push(gap(200));
body.push(note("stop", "La decisión a las 4 semanas",
  [run("Mirá dos números: el costo por seguidor y el crecimiento neto de la cuenta. Si el costo "),
   run("no baja de $700", { bold: true, color: INK }), run(" y el crecimiento neto "),
   run("no se sostiene cerca de 90 por semana", { bold: true, color: INK }),
   run(", el canal se agotó a esta escala y esa plata rinde más en las campañas que generan tasaciones.")],
  "Expectativa realista con todo hecho: entre 420 y 450 seguidores en el mes, gastando $300.000 en vez de $405.107. Mejor negocio, volumen parecido. Si lo que buscás es el doble de seguidores, la pauta no te lo va a dar a un precio razonable en este punto."));

body.push(new Paragraph({ spacing: { before: 500, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } }, children: [] }));
body.push(p([run("De dónde salen los números. ", { bold: true, color: INK, size: 18 }),
  run("Análisis de la cuenta del 21/09/2026: serie diaria del 22/07 al 20/09, desgloses por ubicación, edad y anuncio de los últimos 30 días. Seguidores medidos con instagram_profile_follow_v2 y contrastados con el conteo real de la cuenta de Instagram.",
    { size: 18, color: INK3 })], { after: 110 }));
body.push(p([run("Sobre los nombres de los menús. ", { bold: true, color: INK, size: 18 }),
  run("Meta renombra opciones seguido. Si alguno no aparece con el nombre exacto, buscá el concepto: presupuesto a nivel campaña, ubicaciones manuales, exclusión de audiencias personalizadas.",
    { size: 18, color: INK3 })], { after: 0 }));

// ============================ package ============================
const doc = new Document({
  creator: "Caramés Lanús Este",
  title: "Campaña de interacción — plan de corrección",
  description: "Plan de corrección · 21 de septiembre de 2026",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 20, color: INK2 } }
    },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal", next: "Normal",
        run: { font: "Georgia", size: 52, bold: true, color: INK } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: "Georgia", size: 30, bold: true, color: INK } }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1400, right: 1440, bottom: 1400, left: 1440 }
      }
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          run("Caramés Lanús Este  ·  Plan de corrección  ·  21/09/2026  ·  ", { size: 15, color: INK3 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 15, color: INK3 })
        ]
      })] })
    },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Runbook v2 - Campana de interaccion.docx", buf);
  console.log("escrito:", buf.length, "bytes");
});
