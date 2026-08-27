#!/usr/bin/env python3
"""Reproduce el diagnóstico de la campaña de Meta a partir del export de la
planilla Carames_Leads_DM.

El export es el JSON que devuelve la lectura de Drive: {"fileContent": "<markdown>"}
donde el markdown son las 9 pestañas de la planilla concatenadas como tablas.

Uso:
    python3 analizar_leads.py <export.json>
"""

import collections
import json
import re
import sys

# Pestañas relevantes, por el orden en que aparecen en el export.
TAB_META_DETALLE = 3      # Fecha, Nombre, Telefono, Busca para, Tiene prop..., Origen, Estado
TAB_CONSOLIDADO = 8       # Fecha, Nombre, Tel (clave), Canal, Detalle, Estado
TAB_DEDUP = 9             # Teléfono (clave), Contactos, Primer contacto, ..., Canales, Último estado
TAB_GOOGLE_ADS = 2        # leads de Google Ads
TAB_TASACIONES = 7        # espejo de la agenda de tasaciones

SEP_CELLS = {":-:", "---", ":-", ":--:", "-"}


def cargar_tablas(path):
    """Parte el export en tablas. Cada tabla arranca tras una fila separadora."""
    contenido = json.load(open(path))["fileContent"]
    lineas = contenido.split("\n")

    seps = []
    for i, linea in enumerate(lineas):
        s = linea.strip()
        if not s.startswith("|"):
            continue
        celdas = [c.strip() for c in s.strip("|").split("|")]
        if celdas and all(c in SEP_CELLS for c in celdas):
            seps.append(i)

    tablas = {}
    limites = seps + [len(lineas)]
    for n, inicio_sep in enumerate(seps):
        inicio = inicio_sep + 1
        fin = limites[n + 1] - 2 if n + 1 < len(seps) else len(lineas)
        encabezado = [c.strip() for c in lineas[inicio].strip().strip("|").split("|")]
        filas = [
            [c.strip() for c in lineas[j].strip().strip("|").split("|")]
            for j in range(inicio + 1, fin)
        ]
        tablas[n + 1] = (encabezado, filas)
    return tablas


def indices(encabezado):
    return {h: i for i, h in enumerate(encabezado)}


def normalizar_tel(bruto):
    """Últimos 8 dígitos, sin los prefijos 54 / 9 / 11. Es la clave de cruce."""
    n = re.sub(r"\D", "", bruto or "")
    n = re.sub(r"^54", "", n)
    n = re.sub(r"^9", "", n)
    n = re.sub(r"^11", "", n)
    return n[-8:] if len(n) >= 8 else n


def presupuesto(detalle):
    m = re.search(r"USD [\d\-k\+]+", detalle)
    return m.group(0) if m else "(sin dato)"


def porcentaje(parte, total):
    return f"{parte / total * 100:.1f}%" if total else "-"


def main(path):
    tablas = cargar_tablas(path)

    # ---- cohorte de agosto por Meta, deduplicada por teléfono ----
    enc, filas = tablas[TAB_DEDUP]
    ix = indices(enc)
    agosto_meta = [
        f
        for f in filas
        if len(f) > ix["Último estado"]
        and f[ix["Primer contacto"]].startswith("2026-08")
        and "Meta" in f[ix["Canales por los que entró"]]
    ]
    n = len(agosto_meta)
    print(f"=== Cohorte agosto · Meta: {n} leads únicos ===")

    con_propiedad = [
        f for f in agosto_meta
        if "tiene propiedad" in f[ix["Qué busca / último detalle"]].lower()
    ]
    print(f"  con propiedad para vender : {len(con_propiedad):3d} ({porcentaje(len(con_propiedad), n)})")
    print(f"  solo compradores          : {n - len(con_propiedad):3d} ({porcentaje(n - len(con_propiedad), n)})")

    print("\n  Estado:")
    for estado, cant in collections.Counter(f[ix["Último estado"]] for f in agosto_meta).most_common():
        print(f"    {cant:4d} ({porcentaje(cant, n):>6})  {estado}")

    print("\n  Presupuesto declarado:")
    presupuestos = collections.Counter(presupuesto(f[ix["Qué busca / último detalle"]]) for f in agosto_meta)
    for rango, cant in presupuestos.most_common():
        print(f"    {cant:4d} ({porcentaje(cant, n):>6})  {rango}")
    bajo = presupuestos["USD 0-50k"] + presupuestos["USD 50-100k"]
    print(f"    -> por debajo de USD 100k: {bajo} ({porcentaje(bajo, n)})")

    print("\n  Veces contactado:")
    for veces, cant in sorted(collections.Counter(f[ix["Contactos"]] for f in agosto_meta).items()):
        print(f"    {cant:4d} leads contactados {veces} vez/veces")

    # los únicos que podían terminar en tasación, y que no fueron atendidos
    perdidos = sorted(
        (f for f in con_propiedad if f[ix["Último estado"]] == "Sin contestar"),
        key=lambda f: f[ix["Primer contacto"]],
    )
    print(f"\n  !! Propietarios con propiedad para vender SIN CONTESTAR: {len(perdidos)}")
    for f in perdidos:
        print(f"       {f[ix['Primer contacto']]}  {f[ix['Nombre']][:26]:<26} {f[0]}")

    # ---- cohorte de julio, sin deduplicar (la que quedó vencida) ----
    enc8, filas8 = tablas[TAB_CONSOLIDADO]
    julio = [f for f in filas8 if len(f) > 5 and f[3] == "Meta"]
    print(f"\n=== Cohorte julio · Meta: {len(julio)} registros ===")
    for estado, cant in collections.Counter(f[5] for f in julio).most_common():
        print(f"  {cant:4d} ({porcentaje(cant, len(julio)):>6})  {estado}")

    # ---- atribución: ¿alguna tasación vino de Meta? ----
    telefonos_meta = {normalizar_tel(f[0]) for f in filas if len(f) > ix["Último estado"]
                      and "Meta" in f[ix["Canales por los que entró"]]}
    telefonos_meta |= {normalizar_tel(f[2]) for f in julio}

    encg, filasg = tablas[TAB_GOOGLE_ADS]
    ixg = indices(encg)
    telefonos_google = {
        normalizar_tel(f[ixg["Telefono"]])
        for f in filasg
        if len(f) > ixg["Origen"] and "Google" in f[ixg["Origen"]]
    }

    _, filas7 = tablas[TAB_TASACIONES]
    tasaciones = [
        {"creada": f[1], "nombre": f[3], "tel": f[4]}
        for f in filas7
        if len(f) > 4 and re.match(r"\d{2}/\d{2}/\d{4}", f[1] or "")
    ]

    print(f"\n=== Atribución de tasaciones ({len(tasaciones)} en el historial) ===")
    origen = collections.Counter()
    for t in tasaciones:
        clave = normalizar_tel(t["tel"])
        if clave in telefonos_meta:
            origen["Meta"] += 1
        elif clave in telefonos_google:
            origen["Google Ads"] += 1
        else:
            origen["Otro (orgánico/portal/referido/directo)"] += 1
    for canal, cant in origen.most_common():
        print(f"  {cant:4d}  {canal}")

    agosto = [t for t in tasaciones if t["creada"][3:10] == "08/2026"]
    print(f"\n  Tasaciones creadas en agosto: {len(agosto)}")
    for t in agosto:
        clave = normalizar_tel(t["tel"])
        canal = "META" if clave in telefonos_meta else ("Google Ads" if clave in telefonos_google else "otro")
        print(f"    {t['creada']}  {t['nombre'][:28]:<28} {canal}")

    desde_meta = origen.get("Meta", 0)
    print(f"\n  >> Teléfonos de Meta en el universo: {len(telefonos_meta)}")
    print(f"  >> Tasaciones originadas en Meta   : {desde_meta}")
    if desde_meta == 0:
        print("  >> Costo por tasación vía Meta     : sin definir (denominador cero)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
