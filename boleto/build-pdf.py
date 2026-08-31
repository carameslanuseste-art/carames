#!/usr/bin/env python3
"""Genera el PDF del boleto a partir de contenido.json (misma fuente que el .docx)."""
import json, os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

BASE = os.path.dirname(os.path.abspath(__file__))
F = "/usr/share/fonts/truetype/liberation"   # metric-compatible con Times New Roman

PT = 12
MARG_L, MARG_R, MARG_T, MARG_B = 30, 25, 25, 25   # mm
LINE = 5.6      # interlineado mm
IND  = 10       # sangria de clausula / continuacion mm


class Boleto(FPDF):
    def footer(self):
        self.set_y(-18)
        self.set_font("Lib", "", 9)
        self.cell(0, 6, f"Página {self.page_no()} de {{nb}}", align="R")


pdf = Boleto(format="A4", unit="mm")
pdf.add_font("Lib", "",  f"{F}/LiberationSerif-Regular.ttf")
pdf.add_font("Lib", "B", f"{F}/LiberationSerif-Bold.ttf")
pdf.set_margins(MARG_L, MARG_T, MARG_R)
# cell() agrega 1mm de padding interno por defecto: eso desplazaria el texto
# respecto de las posiciones calculadas y desalinearia subrayados y resaltados.
pdf.c_margin = 0
pdf.set_auto_page_break(True, margin=MARG_B)
pdf.add_page()

FULL = pdf.w - MARG_L - MARG_R
blocks = json.load(open(f"{BASE}/contenido.json"))


def seg_w(text, style):
    pdf.set_font("Lib", "B" if style[0] else "", PT)
    return pdf.get_string_width(text)


SPACE = None  # se calcula tras cargar la fuente


def tokenize(runs):
    """Convierte los runs en tokens separados por espacio.

    Cada token es una lista de segmentos (texto, estilo) que se dibujan
    contiguos, sin espacio intermedio: asi un cambio de estilo a mitad de
    palabra -- p.ej. negrita seguida de coma -- no introduce un espacio.
    """
    chars = []
    for r in runs:
        st = (bool(r.get("b")), bool(r.get("u")), bool(r.get("fill")))
        for ch in r["t"]:
            chars.append((ch, st))

    tokens, cur = [], []
    for ch, st in chars:
        if ch == " ":
            if cur:
                tokens.append(cur)
                cur = []
            continue
        if cur and cur[-1][1] == st:
            cur[-1] = (cur[-1][0] + ch, st)
        else:
            cur.append((ch, st))
    if cur:
        tokens.append(cur)
    return tokens


def is_filler(tok):
    """True si el token es la tira de guiones de relleno del boleto original."""
    return len(tok) == 1 and len(tok[0][0]) > 5 and set(tok[0][0]) == {"-"}


def token_w(tok):
    return sum(seg_w(t, s) for t, s in tok)


def draw_line(tokens, x0, width, justify):
    """Dibuja una linea. Coloca los segmentos, luego el texto, y por ultimo los
    subrayados fusionados, de modo que un tramo subrayado de varias palabras
    quede con una linea continua y no cortada en cada espacio."""
    gaps = len(tokens) - 1
    natural = sum(token_w(t) for t in tokens) + gaps * SPACE
    extra = (width - natural) / gaps if (justify and gaps > 0 and width > natural) else 0

    # --- 1. posiciones ---
    items, x = [], x0
    for i, tok in enumerate(tokens):
        for text, st in tok:
            w = seg_w(text, st)
            items.append([x, w, text, st])
            x += w
        if i < gaps:
            gw = SPACE + extra
            # el espacio hereda subrayado/resaltado solo si ambos lados lo tienen,
            # para que un tramo de varias palabras quede continuo
            izq, der = tokens[i][-1][1], tokens[i + 1][0][1]
            items.append([x, gw, None, (False, izq[1] and der[1], izq[2] and der[2])])
            x += gw

    y = pdf.get_y()

    # --- 2. resaltados (debajo del texto) ---
    for ix, w, text, st in items:
        if st[2]:
            pdf.set_fill_color(255, 240, 130)
            pdf.rect(ix, y + 0.5, w, LINE - 1.0, style="F")

    # --- 3. texto ---
    for ix, w, text, st in items:
        if text is None:
            continue
        pdf.set_font("Lib", "B" if st[0] else "", PT)
        pdf.set_xy(ix, y)
        pdf.cell(w, LINE, text, align="L")

    # --- 4. subrayados fusionados ---
    pdf.set_line_width(0.25)
    run_start = None
    for ix, w, text, st in items + [[x, 0, "", (False, False, False)]]:
        if st[1]:
            if run_start is None:
                run_start = ix
            run_end = ix + w
        elif run_start is not None:
            pdf.line(run_start, y + LINE - 1.0, run_end, y + LINE - 1.0)
            run_start = None

    pdf.set_xy(x, y)


def write_block(blk):
    tipo = blk["tipo"]
    twips_mm = 0.3528 / 20
    pdf.set_y(pdf.get_y() + blk.get("before", 0) * twips_mm)
    after = blk.get("after", 200) * twips_mm

    if tipo == "titulo":
        pdf.set_font("Lib", "B", 15)
        pdf.cell(0, 9, blk["runs"][0]["t"], align="C",
                 new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_y(pdf.get_y() + after)
        return

    # clausula: sangria francesa (1ra linea al margen, resto sangrado)
    first_ind = IND if tipo == "continuacion" else 0
    rest_ind  = 0 if tipo == "parrafo" else IND

    line, line_w, ind = [], 0.0, first_ind
    izquierda = blk.get("alignment") == "left"

    def flush(last):
        nonlocal line, line_w, ind
        if line:
            if pdf.get_y() + LINE > pdf.h - MARG_B:
                pdf.add_page()
            draw_line(line, MARG_L + ind, FULL - ind,
                      justify=not (last or izquierda))
            pdf.set_xy(MARG_L, pdf.get_y() + LINE)
        line, line_w, ind = [], 0.0, rest_ind

    for tok in tokenize(blk["runs"]):
        # Los guiones del original son relleno de linea: en vez de tratarlos como
        # una palabra larga que desborda y deja la linea anterior estirada, se
        # recortan para ocupar exactamente el espacio que queda.
        if is_filler(tok):
            libre = (FULL - ind) - line_w - (SPACE if line else 0)
            n = int(libre / seg_w("-", (False, False, False)))
            if n < 3:
                flush(last=True)
                continue
            tok = [("-" * n, tok[0][1])]
            line.append(tok)
            flush(last=True)
            continue
        tw = token_w(tok)
        add = tw if not line else tw + SPACE
        if line and line_w + add > FULL - ind:
            flush(last=False)
            add = tw
        line.append(tok)
        line_w += add
    flush(last=True)
    pdf.set_y(pdf.get_y() + after)


pdf.set_font("Lib", "", PT)
SPACE = pdf.get_string_width(" ")

for blk in blocks:
    write_block(blk)

out = f"{BASE}/BOLETO_COMPRAVENTA_BOLIVAR_855_corregido.pdf"
pdf.output(out)
print("OK ->", out, os.path.getsize(out), "bytes,", pdf.page_no(), "paginas")
