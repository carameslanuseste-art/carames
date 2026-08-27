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

body.push(new Paragraph({
  spacing: { after: 90 },
  children: [run("CARAMÉS LANÚS ESTE   ·   RUNBOOK   ·   27 DE AGOSTO DE 2026",
    { size: 15, bold: true, color: INK3, font: "Consolas" })]
}));
body.push(new Paragraph({
  spacing: { after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } },
  children: []
}));
body.push(new Paragraph({
  heading: HeadingLevel.TITLE,
  spacing: { after: 200 },
  children: [run("Reconstruir la campaña de interacción", { size: 52, bold: true, color: INK })]
}));
body.push(p("Paso a paso para pasar de un conjunto con ubicaciones automáticas a tres conjuntos con presupuesto propio. Tildá cada casillero a medida que avanzás.",
  { size: 23, color: INK2, after: 260 }));

body.push(table(
  null,
  [
    ["Dónde", "Administrador de anuncios · cuenta «Caramés Bienes Raices - Sucursal Lanús Este»"],
    ["Qué vas a tocar", "Campaña de interacción · activa desde el 8/4/2026 · $7.500 diarios"],
    ["Cuánto lleva", "45 a 60 minutos, más el tiempo de editar los videos nuevos"]
  ],
  [2400, 6626]
));
body.push(gap(220));

body.push(note("warn", "Elegí bien el día",
  "No arranques un viernes ni antes de irte de viaje. Los conjuntos nuevos entran en fase de aprendizaje y los primeros tres días son los más ruidosos: conviene que puedas mirarlos."));

// ---------------- FASE 1 ----------------
body.push(...phase("Fase 1", "Apagar el presupuesto de campaña", "10 min"));
body.push(p("Sin esto, nada de lo que sigue funciona. Hoy el presupuesto está a nivel campaña y es Meta quien decide cuánto le toca a cada conjunto — por eso repartió $292.520 a uno y $18.172 al otro.", { after: 180 }));

body.push(...step(1, "Abrí la campaña en modo edición",
  [run("En la pestaña "), run("Campañas", { bold: true, color: INK }), run(", tildá el casillero de "),
   run("Campaña de interacción", { bold: true, color: INK }), run(" y hacé clic en "),
   run("Editar", { bold: true, color: INK }), run(". Se abre el panel lateral.")]));

body.push(...step(2, "Buscá el interruptor del presupuesto Advantage",
  [run("Aparece como "), run("Presupuesto de campaña Advantage", { bold: true, color: INK }),
   run(". En cuentas más viejas figura como "), run("Optimización del presupuesto de la campaña", { bold: true, color: INK }),
   run(" o CBO — es lo mismo.")]));

body.push(...step(3, "Apagalo",
  "Al desactivarlo, el campo de presupuesto desaparece del nivel campaña y pasa a pedirse en cada conjunto. Es lo que buscamos."));

body.push(...step(4, "Publicá y verificá",
  [run("Guardá los cambios. En la lista de campañas, la columna "), run("Presupuesto", { bold: true, color: INK }),
   run(" tiene que pasar de decir «$7.500 diarios» a "), run("Usar presupuesto del conjunto de anuncios", { bold: true, color: INK }),
   run(". Si sigue mostrando un monto, no se guardó.")]));

body.push(gap(160));
body.push(note("stop", "Si el interruptor está bloqueado",
  "En algunas cuentas Meta no deja apagar el CBO de una campaña ya creada. Si te pasa: duplicá la campaña y en el duplicado dejá el presupuesto Advantage apagado desde el arranque. Armá los tres conjuntos ahí y pausá la original recién cuando la nueva esté gastando. Te queda la vieja intacta por si querés volver atrás."));
body.push(gap(120));
body.push(note("info", null,
  [run("Apagar el CBO "), run("reinicia la fase de aprendizaje", { bold: true, color: INK }),
   run(" de los conjuntos. Es esperable y es el precio de la corrección: los primeros días van a estar movidos.")]));

// ---------------- FASE 2 ----------------
body.push(...phase("Fase 2", "Armar los tres conjuntos", "25 min"));
body.push(p("La idea es una ubicación por conjunto, cada uno con su presupuesto, para que Stories y Feed dejen de perder la subasta interna contra Reels.", { after: 120 }));
body.push(p([run("Atajo: en vez de crear los tres de cero, "),
  run("duplicá dos veces el conjunto «alquileres - NUEVO»", { bold: true, color: INK }),
  run(". Así heredás la geo y las exclusiones de seguidores, que ya están bien configuradas, y solo cambiás lo de abajo.")], { after: 200 }));

body.push(table(
  ["Conjunto", "Nombre a poner", "Presupuesto diario", "Única ubicación tildada"],
  [
    ["A", "SEG / IG Reels", "$3.000", "Instagram · Reels"],
    ["B", "SEG / IG Stories", "$2.600", "Instagram · Historias"],
    ["C", "SEG / IG Feed", "$1.900", "Instagram · Feed"]
  ],
  [1100, 2700, 2200, 3026]
));
body.push(gap(160));

body.push(...step(1, "Duplicá el conjunto base dos veces",
  [run("Sobre "), run("Conjunto de anuncio interacciones / IG y Facebook / alquileres - NUEVO", { bold: true, color: INK }),
   run(", usá "), run("Duplicar", { bold: true, color: INK }), run(". Vas a terminar con tres, contando el original.")]));

body.push(...step(2, "Renombralos según la tabla",
  "El prefijo SEG te va a servir después para filtrar rápido en los informes. Los nombres largos actuales no dicen qué ubicación es cada uno."));

body.push(...step(3, "Cargá el presupuesto diario de cada uno",
  "$3.000, $2.600 y $1.900. Suman los mismos $7.500 que gastás hoy, así que no estás aumentando la inversión: solo la estás repartiendo distinto."));

body.push(...step(4, "Pasá las ubicaciones a manuales",
  [run("En la sección "), run("Ubicaciones", { bold: true, color: INK }), run(", cambiá de "),
   run("Ubicaciones Advantage+", { bold: true, color: INK }), run(" a "),
   run("Ubicaciones manuales", { bold: true, color: INK }),
   run(". Después destildá todo y dejá una sola por conjunto, según la tabla.")],
  [run("Asegurate de que queden destildadas "), run("Facebook", { bold: true, color: INK }), run(", "),
   run("Messenger", { bold: true, color: INK }), run(" y "), run("Audience Network", { bold: true, color: INK }),
   run(" en los tres. Facebook se llevó $53.580 y devolvió 5 seguidores.")]));

body.push(...step(5, "Bajá el techo de edad a 54",
  [run("Hoy está en 18–65. La franja de 65 o más te cuesta $1.350 por seguidor con 0,71% de conversión: es toque accidental casi puro. Dejalo en "),
   run("18 a 54", { bold: true, color: INK }), run(".")]));

body.push(...step(6, "Cambiá a audiencia original",
  [run("Con "), run("Audiencia Advantage+", { bold: true, color: INK }),
   run(" activada, la edad que ponés es apenas una sugerencia y Meta puede entregar fuera de ese rango. Si querés que el corte en 54 se respete de verdad, buscá el enlace "),
   run("Cambiar a audiencia original", { bold: true, color: INK }), run(" y usá esa.")],
  "Es un cambio con costo: la audiencia original suele encarecer un poco. Si preferís no tocarlo, dejá Advantage+ y aceptá que el límite de edad es orientativo."));

body.push(...step(7, "Confirmá que las exclusiones siguen puestas",
  [run("En "), run("Audiencias personalizadas a excluir", { bold: true, color: INK }),
   run(" tienen que seguir apareciendo "), run("Seguidores de instagram", { bold: true, color: INK, font: "Consolas" }),
   run(" y "), run("Seguidores de facebook", { bold: true, color: INK, font: "Consolas" }),
   run(" en los tres conjuntos. Eso evita que pagues por mostrarle el anuncio a gente que ya te sigue. Al duplicar se heredan, pero verificalo.")]));

body.push(...step(8, "Dejá la ubicación geográfica como está",
  "Lanús + 17 km, personas que viven ahí o estuvieron hace poco. Está bien: el 96,5% de los contactos son del AMBA. No es acá donde está el problema."));

body.push(gap(160));
body.push(note("ok", "Antes de publicar",
  [run("Repasá que cada conjunto tenga "), run("una sola", { bold: true, color: INK }),
   run(" ubicación tildada y su propio presupuesto. Si alguno quedó con dos, Meta va a volver a concentrar el gasto y perdés el sentido del ejercicio.")]));

// ---------------- FASE 3 ----------------
body.push(...phase("Fase 3", "Los anuncios", "15 min + edición"));
body.push(p("Acá está la otra mitad del resultado. Los anuncios que traen seguidores baratos son los que la gente termina de ver, y hoy los que se llevan el presupuesto se ven completos apenas el 1,1% de las veces.", { after: 180 }));

body.push(...step(1, "Poné tres anuncios en cada conjunto",
  "Con menos de tres no hay rotación posible y todo el peso cae en una sola pieza, que es exactamente lo que pasó en agosto."));

body.push(...step(2, "Reactivá Córdoba 920 si la propiedad sigue disponible",
  "Es el que mejor convierte de toda la campaña: 6,28% de visita a seguidor y $383 por seguidor. Si ya se alquiló, no lo uses — pero mirá el video para copiarle el estilo."));

body.push(...step(3, "Reemplazá Basavilbaso 1665 1A",
  "Trajo 394 seguidores, más que ningún otro anuncio, y hoy no hay nada equivalente corriendo. Necesitás una pieza que ocupe ese lugar."));

body.push(...step(4, "Cambiá qué mostrás en el primer cuadro",
  "Dejá de abrir con la fachada. Los tres anuncios que revisé son puerta y frente, y el que hoy consume el presupuesto es una puerta de chapa cerrada con dos cajas de gas.",
  [run("Abrí con "), run("el mejor ambiente de adentro, con luz natural", { bold: true, color: INK }),
   run(", y si se puede con alguien caminando por el espacio. Los que funcionan tienen color, luz y profundidad.")]));

body.push(...step(5, "Pausá Blanco Encalada 2396 y Córdoba 2056",
  "$756 y $874 por seguidor, con 1,29% y 1,06% de conversión. Son los dos que trajeron el problema. Pausalos, no los borres: la historia sirve para comparar."));

// ---------------- FASE 4 ----------------
body.push(...phase("Fase 4", "Apagar lo viejo y medir", "10 min"));

body.push(...step(1, "Esperá a que los conjuntos nuevos estén aprobados y gastando",
  [run("Recién cuando veas gasto real en los tres, pausá el conjunto viejo "),
   run("reels - ventas NUEVO", { bold: true, color: INK }),
   run(". No los apagues antes o te quedás sin nada corriendo.")]));

body.push(...step(2, "Agregá la columna de seguidores al informe",
  [run("En "), run("Columnas → Personalizar columnas", { bold: true, color: INK }), run(", buscá "),
   run("Seguidores nuevos en Instagram", { bold: true, color: INK }), run(" y agregala junto a "),
   run("Importe gastado", { bold: true, color: INK }), run(". Es la métrica que la API llama "),
   run("instagram_profile_follow_v2", { font: "Consolas", color: INK }), run(".")],
  "Guardá esa vista como preajuste. Mientras mires «costo por resultado», vas a estar viendo visitas al perfil y no seguidores — que es justamente lo que ocultó el problema durante dos meses."));

body.push(...step(3, "Anotá el punto de partida",
  [run("Hoy estás en "), run("$762 por seguidor", { bold: true, color: INK }), run(" y unos "),
   run("89 a 121 seguidores por semana", { bold: true, color: INK }),
   run(". Guardá ese número: es contra lo que vas a comparar dentro de dos semanas.")]));

body.push(...step(4, "Fijá la regla de corte",
  [run("Cualquier anuncio que después de 7 días y $15.000 gastados esté arriba de "),
   run("$600 por seguidor", { bold: true, color: INK }),
   run(", se pausa. Con esa regla, los dos anuncios caros se hubieran cortado solos hace tres semanas.")]));

body.push(gap(160));
body.push(note("stop", "Las primeras dos semanas",
  [run("No toques nada.", { bold: true, color: INK }),
   run(" Ni presupuestos, ni segmentación, ni anuncios nuevos. Los conjuntos están en aprendizaje y cada cambio lo reinicia. Vas a ver números feos los primeros tres días: es normal.")],
  "La primera lectura seria es a los 7 días. La decisión de escalar, a los 14."));

// ---------------- DESPUÉS ----------------
body.push(...phase("Después", "Qué mirar a los 14 días", "—"));
body.push(p("Compará el costo por seguidor de cada conjunto contra estos valores, que son los que tenés hoy por ubicación:", { after: 180 }));

body.push(table(
  ["Conjunto", "Referencia actual", "Si sale mejor", "Si sale peor"],
  [
    ["IG Feed", "$176", "Subile presupuesto de a 20%", "Esperá otra semana antes de tocar"],
    ["IG Stories", "$237", "Subile presupuesto de a 20%", "Esperá otra semana antes de tocar"],
    ["IG Reels", "$833", "Dejalo como está", "Bajale presupuesto a favor de los otros dos"]
  ],
  [1700, 1700, 2600, 3026]
));
body.push(gap(180));

body.push(note("warn", "Expectativa realista",
  [run("Los $176 y $237 de Feed y Stories salen de muy poca inversión — $5.468 y $10.172 en treinta días. Al darles diez veces más presupuesto "),
   run("el costo va a subir sí o sí", { bold: true, color: INK }), run(". No los tomes como promesa.")],
  "Aun duplicándose siguen siendo la mitad de caros que Reels. El escenario conservador es pasar de 425 a unos 600 seguidores por mes; el optimista, cerca de 1.000. Con la misma plata en los dos casos."));

// ---------------- cierre ----------------
body.push(new Paragraph({
  spacing: { before: 500, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: RULE } },
  children: []
}));
body.push(p([run("De dónde salen los números. ", { bold: true, color: INK, size: 18 }),
  run("Todos los valores vienen del análisis de la cuenta del 27/08/2026: serie semanal de los últimos 90 días, desglose por ubicación y edad de los últimos 30, y detalle de los once anuncios con inversión real. Seguidores medidos con instagram_profile_follow_v2.",
    { size: 18, color: INK3 })], { after: 110 }));
body.push(p([run("Sobre los nombres de los menús. ", { bold: true, color: INK, size: 18 }),
  run("Meta renombra opciones del Administrador de anuncios seguido. Si alguno no aparece con el nombre exacto que figura acá, buscá el concepto: presupuesto a nivel campaña, ubicaciones manuales, audiencia original, exclusión de audiencias personalizadas.",
    { size: 18, color: INK3 })], { after: 0 }));

// ============================ package ============================
const doc = new Document({
  creator: "Caramés Lanús Este",
  title: "Reconstruir la campaña de interacción",
  description: "Runbook paso a paso · 27 de agosto de 2026",
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
          run("Caramés Lanús Este  ·  Runbook campaña de interacción  ·  ", { size: 15, color: INK3 }),
          new TextRun({ children: [PageNumber.CURRENT], size: 15, color: INK3 })
        ]
      })] })
    },
    children: body
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Runbook - Campana de interaccion.docx", buf);
  console.log("escrito:", buf.length, "bytes");
});
