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
  children: [run("CARAMÉS LANÚS ESTE   ·   PLAN DESDE CERO   ·   21 DE SEPTIEMBRE DE 2026",
    { size: 15, bold: true, color: INK3, font: "Consolas" })] }));
body.push(new Paragraph({ spacing: { after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } }, children: [] }));
body.push(new Paragraph({ heading: HeadingLevel.TITLE, spacing: { after: 200 },
  children: [run("Crecimiento de seguidores — arquitectura completa", { size: 46, bold: true, color: INK })] }));
body.push(p("Tres campañas, seis fases. Reemplaza al plan de corrección anterior: en vez de parchear la campaña actual, construye la base que hoy no existe.",
  { size: 23, color: INK2, after: 260 }));

body.push(table(null, [
  ["Presupuesto", "$10.000 diarios · $300.000 al mes (hoy: $405.107)"],
  ["Punto de partida", "$962 por seguidor atribuido · 27.715 seguidores al 21/09"],
  ["Meta realista", "$500 a $700 por seguidor · 430 a 595 seguidores al mes"],
  ["Cuánto lleva armarlo", "Unas 2 horas, más la producción de videos"]
], [2400, 6626]));
body.push(gap(220));

body.push(note("info", "El principio que ordena todo el plan",
  "Meta no tiene una optimización por «seguidores». Lo más cerca que llegás es «visitas al perfil». Entonces el trabajo no es configurar mejor un botón: es acotarle a Meta dónde gastar, darle la mejor audiencia posible, medir con el número real de la cuenta, y reservar siempre una parte del presupuesto para seguir aprendiendo."));

// ---------------- FASE 0 ----------------
body.push(...phase("Fase 0", "Construir las audiencias", "30 min · una sola vez"));
body.push(p("Esto es lo que hoy no existe y es la base de todo lo demás. Tenés cuatro públicos similares creados sobre semillas de unas 20 personas, y tu mejor semilla —los 17.600 a 20.700 seguidores de Instagram— no la usás para nada más que excluir.", { after: 180 }));

body.push(...step(1, "Creá la audiencia de interacción con Instagram",
  [run("Administrador de anuncios → "), run("Públicos", { bold: true, color: INK }), run(" → "),
   run("Crear público → Público personalizado → Cuenta de Instagram", { bold: true, color: INK }),
   run(". Elegí «Cualquier persona que haya interactuado», ventana de "),
   run("365 días", { bold: true, color: INK }), run(". Nombrala "),
   run("IG · Interacción 365d", { bold: true, color: INK, font: "Consolas" }), run(".")],
  "En el último mes tuviste unas 30.000 visitas al perfil y 421 seguidores. Esta audiencia junta a las ~29.000 que entraron y no siguieron."));

body.push(...step(2, "Creá el público similar de tus seguidores",
  [run("Crear público → "), run("Público similar", { bold: true, color: INK }),
   run(". Como origen elegí "), run("Seguidores de instagram", { bold: true, color: INK, font: "Consolas" }),
   run(", país Argentina, tamaño "), run("1%", { bold: true, color: INK }), run(". Nombrala "),
   run("LAL 1% · Seguidores IG", { bold: true, color: INK, font: "Consolas" }), run(".")],
  "Es la audiencia más relevante que podés construir para buscar gente parecida a la que ya te sigue, y es la que falta."));

body.push(...step(3, "Creá también la versión al 3%",
  [run("Misma receta, tamaño 3%, nombrala "), run("LAL 3% · Seguidores IG", { bold: true, color: INK, font: "Consolas" }), run(".")],
  "Es el respaldo: al cruzar el 1% con tu radio de 17 km la audiencia puede quedar demasiado chica para gastar $7.000 diarios. Si al armar los conjuntos Meta te marca alcance muy limitado, usás la del 3%."));

body.push(gap(140));
body.push(note("warn", "Verificá el tamaño antes de seguir",
  "Cuando cargues la audiencia en un conjunto con la geo de Lanús + 17 km, mirá el alcance estimado que te muestra Meta. Si queda por debajo de unas 80.000 personas, pasá a la del 3%. Con una audiencia chica y $7.000 diarios, la frecuencia se dispara en días y el costo con ella."));

// ---------------- FASE 1 ----------------
body.push(...phase("Fase 1", "Campaña A — Prospección", "$7.000 diarios"));
body.push(p("Gente nueva que todavía no te conoce. Un conjunto por ubicación, con presupuesto propio cada uno, porque es el único modo de que Feed y Stories dejen de perder la subasta interna contra Reels.", { after: 200 }));

body.push(table(["Conjunto", "Ubicación única", "Presupuesto", "Audiencia"], [
  ["A1 · Feed", "Instagram · Feed", "$2.500", "LAL 1% Seguidores"],
  ["A2 · Stories", "Instagram · Historias", "$2.500", "LAL 1% Seguidores"],
  ["A3 · Reels", "Instagram · Reels", "$2.000", "LAL 1% Seguidores"]
], [1700, 2500, 1700, 3126]));
body.push(gap(160));

body.push(...step(4, "Creá la campaña con objetivo Interacción",
  [run("Objetivo "), run("Interacción", { bold: true, color: INK }), run(", optimización "),
   run("Visitas al perfil y a la página", { bold: true, color: INK }), run(". "),
   run("El presupuesto Advantage de campaña tiene que quedar APAGADO", { bold: true, color: ALERT }),
   run(" — el presupuesto va en cada conjunto.")]));
body.push(...step(5, "Configurá los tres conjuntos según la tabla",
  "Ubicaciones manuales, una sola tildada por conjunto. Destildá Facebook, Messenger y Audience Network en los tres."));
body.push(...step(6, "Segmentación común a los tres",
  [run("Geo: "), run("Lanús + 17 km", { bold: true, color: INK }),
   run(" (no la amplíes: ese radio ya cubre Avellaneda, Banfield, Escalada y Lomas de Zamora). Edad "),
   run("18 a 54", { bold: true, color: INK }), run(". Audiencia: "),
   run("LAL 1% · Seguidores IG", { bold: true, color: INK, font: "Consolas" }), run(".")],
  [run("Excluí siempre "), run("Seguidores de instagram", { bold: true, color: INK, font: "Consolas" }),
   run(". Pagar por mostrarle el anuncio a quien ya te sigue es tirar la plata.")]));
body.push(...step(7, "Tres anuncios en cada conjunto",
  "Con menos de tres no hay rotación y todo el peso cae en una sola pieza, que es lo que viene pasando desde julio."));

// ---------------- FASE 2 ----------------
body.push(...phase("Fase 2", "Campaña B — Recontacto", "$1.500 diarios"));
body.push(p("Gente que ya entró a tu perfil y no te siguió. Son unas 29.000 personas por mes que mostraron interés y hoy no volvés a impactar con nada. Es el público más barato que podrías tener y no lo estás usando.", { after: 180 }));

body.push(...step(8, "Creá un conjunto de recontacto",
  [run("Campaña aparte, mismo objetivo y optimización. Audiencia: "),
   run("IG · Interacción 365d", { bold: true, color: INK, font: "Consolas" }), run(" "),
   run("excluyendo", { bold: true, color: INK }), run(" "),
   run("Seguidores de instagram", { bold: true, color: INK, font: "Consolas" }), run(".")],
  "Ubicaciones: Feed e Historias. Reels no, porque es donde el toque accidental es más alto y acá querés intención."));
body.push(...step(9, "Usá un creativo distinto al de prospección",
  "A esta gente ya le mostraste propiedades y no alcanzó. Mostrale un motivo para seguirte: qué va a encontrar en la cuenta si se queda. No una propiedad más."));

// ---------------- FASE 3 ----------------
body.push(...phase("Fase 3", "Campaña C — Laboratorio", "$1.500 diarios"));
body.push(p("Presupuesto reservado para probar una cosa por vez. Es lo que evita volver a quedarse dos meses sin saber qué está fallando.", { after: 180 }));

body.push(table(["Ciclo", "Qué probar", "Contra qué se compara"], [
  ["Semanas 1–4", "Optimización por ThruPlay en vez de visitas al perfil", "A3 · Reels"],
  ["Semanas 5–8", "Audiencia amplia (solo geo) sin público similar", "A1 · Feed"],
  ["Semanas 9–12", "LAL de interacción en vez de LAL de seguidores", "el mejor de A"]
], [1700, 4200, 3126]));
body.push(gap(160));

body.push(...step(10, "Arrancá con la prueba de ThruPlay",
  [run("Mismo objetivo Interacción pero optimizando por "),
   run("Reproducciones de video (ThruPlay)", { bold: true, color: INK }),
   run(", ubicación Reels, misma audiencia que A3.")],
  "La hipótesis: los anuncios que la gente termina de ver son los que traen seguidores baratos. Sarmiento, con 3,69% de reproducción completa, sale $435; Blanco Encalada, con 1,28%, sale $1.015. Si la relación es causal, pedirle a Meta gente que mira debería funcionar mejor que pedirle gente que toca."));
body.push(...step(11, "Una prueba por vez, cuatro semanas cada una",
  "Si probás tres cosas juntas y mejora, no vas a saber cuál fue. La disciplina de un cambio por ciclo es lo que convierte la pauta en algo que se aprende en vez de algo que se adivina."));

// ---------------- FASE 4 ----------------
body.push(...phase("Fase 4", "Sistema creativo", "continuo"));
body.push(p("Es la palanca de mayor impacto y la de mayor varianza. El patrón de tus datos es claro: los anuncios con color, luz y profundidad convierten entre 4 y 6 veces mejor que los de fachada gris.", { after: 180 }));

body.push(...step(12, "Regla del primer cuadro",
  "Abrí con el mejor ambiente de adentro y luz natural. Nunca con la fachada ni con el cartel de ALQUILER encima. El cartel puede aparecer después del primer segundo."));
body.push(...step(13, "Un formato nuevo por semana las primeras tres",
  "Semana 1: recorrido caminando por el interior. Semana 2: vos a cámara con un dato de la zona o del mercado. Semana 3: un dato de barrio o un antes/después.",
  "Los dos últimos no son propiedades. Eso es deliberado: lo que hace que alguien siga una cuenta inmobiliaria no es una propiedad que no le sirve, es la sensación de que ahí va a encontrar algo útil."));
body.push(...step(14, "Rotación quincenal",
  "Cada quince días entra una pieza nueva y sale la peor. Sin esto, en dos meses estás otra vez con el mismo anuncio consumiendo el 30% del presupuesto."));

// ---------------- FASE 5 ----------------
body.push(...phase("Fase 5", "Medición y reglas de corte", "10 min + semanal"));

body.push(...step(15, "Configurá la columna correcta",
  [run("Columnas → Personalizar columnas → agregá "),
   run("Seguidores nuevos en Instagram", { bold: true, color: INK }), run(" junto a "),
   run("Importe gastado", { bold: true, color: INK }), run(". Guardá la vista como preajuste.")],
  "Mientras mires «costo por resultado» estás viendo visitas al perfil, no seguidores. Eso es lo que ocultó el problema durante dos meses."));
body.push(...step(16, "Anotá el conteo real de la cuenta cada lunes",
  "Meta se atribuye un 12% más de seguidores de los que la cuenta gana de verdad: informó 421 en cuatro semanas mientras Instagram subió de 27.338 a 27.715, o sea 377 reales. El número de la cuenta es el que manda."));
body.push(...step(17, "Regla de corte por anuncio",
  [run("Arriba de "), run("$600 por seguidor", { bold: true, color: INK }),
   run(" después de 7 días y $15.000 gastados, se pausa. Sin excepción y sin esperar a ver si mejora.")]));
body.push(...step(18, "Regla de reparto entre conjuntos",
  "Cada cuatro semanas, el conjunto con mejor costo por seguidor sube 20% de presupuesto y el peor baja 20%. Nunca más del 20% de una vez, para no reiniciar el aprendizaje."));
body.push(...step(19, "No toques nada las primeras dos semanas",
  "Todo lo nuevo entra en fase de aprendizaje. Los primeros tres días vas a ver números feos: es normal. La primera lectura seria es a los 7 días; la primera decisión, a los 14."));

body.push(gap(200));
body.push(note("stop", "La decisión de canal, a las 8 semanas",
  [run("Dos números: costo por seguidor y crecimiento neto de la cuenta. Si a las 8 semanas el costo "),
   run("no bajó de $700", { bold: true, color: INK }), run(" y el crecimiento neto "),
   run("no se sostiene cerca de 90 por semana", { bold: true, color: INK }),
   run(", la pauta de seguidores se agotó a esta escala y esa plata rinde más en las campañas que generan tasaciones.")]));

body.push(gap(140));
body.push(note("warn", "Lo que este plan NO te va a dar",
  "Un salto de volumen. Con todo bien hecho la expectativa es 430 a 595 seguidores por mes gastando $300.000 — mejor negocio que hoy, volumen parecido o algo mejor.",
  "Llevás cinco meses sobre la misma zona con 20.000 seguidores ya excluidos. Duplicar el ritmo de crecimiento no sale de la pauta: sale de contenido que circule solo y de colaboraciones con cuentas locales. Tu alcance orgánico ya es de 56.000 por semana, comparable al pago. Ahí está el techo que la pauta no levanta."));

body.push(new Paragraph({ spacing: { before: 500, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } }, children: [] }));
body.push(p([run("De dónde salen los números. ", { bold: true, color: INK, size: 18 }),
  run("Análisis de la cuenta del 21/09/2026: serie diaria del 22/07 al 20/09, desgloses por ubicación, edad y anuncio de los últimos 30 días, y listado de públicos personalizados. Seguidores medidos con instagram_profile_follow_v2 y contrastados con el conteo real de la cuenta.",
    { size: 18, color: INK3 })], { after: 110 }));
body.push(p([run("Sobre las estimaciones. ", { bold: true, color: INK, size: 18 }),
  run("El rango de $500 a $700 por seguidor asume que el público similar mejora la calidad respecto de la segmentación amplia actual. Es una hipótesis razonable pero sin probar en esta cuenta: por eso la fase 3 existe y por eso las reglas de corte son estrictas.",
    { size: 18, color: INK3 })], { after: 0 }));

// ============================ package ============================
const doc = new Document({
  creator: "Caramés Lanús Este",
  title: "Crecimiento de seguidores — arquitectura completa",
  description: "Plan desde cero · 21 de septiembre de 2026",
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
          run("Caramés Lanús Este  ·  Plan desde cero  ·  21/09/2026  ·  ", { size: 15, color: INK3 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 15, color: INK3 })
        ]
      })] })
    },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Plan desde cero - Seguidores IG.docx", buf);
  console.log("escrito:", buf.length, "bytes");
});
