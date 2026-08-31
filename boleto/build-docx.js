// Genera el .docx del boleto a partir de contenido.js
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, PageNumber,
} = require("docx");
const fs = require("fs");
const { CONTENIDO } = require("./contenido.js");

const FONT = "Times New Roman";
const SZ = 24; // 12pt

const run = (r, size = SZ) => new TextRun({
  text: r.t, font: FONT, size, color: "000000",
  bold: !!r.b,
  ...(r.u ? { underline: {} } : {}),
  ...(r.fill ? { highlight: "yellow" } : {}),
});

const render = (blk) => {
  if (blk.tipo === "titulo") {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: blk.after, before: blk.before },
      children: blk.runs.map((r) => run(r, 28)),
    });
  }
  const indent =
    blk.tipo === "clausula"     ? { left: 567, hanging: 567 } :
    blk.tipo === "continuacion" ? { left: 567 } : undefined;
  return new Paragraph({
    alignment: blk.alignment === "left" ? AlignmentType.LEFT : AlignmentType.JUSTIFIED,
    spacing: { after: blk.after, before: blk.before, line: 300 },
    indent,
    children: blk.runs.map((r) => run(r)),
  });
};

const doc = new Document({
  creator: "Boleto de compraventa",
  title: "Boleto de compraventa - Bolivar 855 CABA",
  styles: { default: { document: { run: { font: FONT, size: SZ, color: "000000" } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },                 // A4
        margin: { top: 1418, right: 1418, bottom: 1418, left: 1701 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Página ", font: FONT, size: 20 }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
            new TextRun({ text: " de ", font: FONT, size: 20 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 20 }),
          ],
        })],
      }),
    },
    children: CONTENIDO.map(render),
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = __dirname + "/BOLETO_COMPRAVENTA_BOLIVAR_855_corregido.docx";
  fs.writeFileSync(out, buf);
  fs.writeFileSync(__dirname + "/contenido.json", JSON.stringify(CONTENIDO, null, 1));
  console.log("OK ->", out, buf.length, "bytes");
});
