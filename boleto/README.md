# Boleto de compraventa – Bolivar 855, CABA

Boleto corregido según las observaciones de la abogada (títulos perfectos,
escrituración y jurisdicción en CABA, asentimiento conyugal).

| Archivo | Qué es |
|---|---|
| `BOLETO_COMPRAVENTA_BOLIVAR_855_corregido.docx` | Documento editable, para la abogada / escribanía |
| `BOLETO_COMPRAVENTA_BOLIVAR_855_corregido.pdf` | Mismo texto, para leer o imprimir |
| `CAMBIOS.md` | Detalle de cada corrección y puntos a revisar |

## Cómo se generan

`contenido.js` es la **única fuente del texto**; los dos documentos se generan
desde ahí, de modo que no puedan quedar desincronizados.

```bash
npm install docx && pip install fpdf2
node boleto/build-docx.js     # -> .docx  (y regenera contenido.json)
python3 boleto/build-pdf.py   # -> .pdf   (lee contenido.json)
```

Para cambiar el texto se edita `contenido.js` y se corren los dos comandos.
