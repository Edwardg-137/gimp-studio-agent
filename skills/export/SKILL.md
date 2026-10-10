---
name: export
description: Cierra el flujo. Exporta desde el máster, controla calidad JPEG solo con el fragmento documentado, y reabre el archivo para comprobarlo.
---

# export

Requiere el servidor MCP `gimp` (`gimp-mcp serve`). Solo después de un `review` que haya pasado.

## Cuándo usar

“Guárdala para Instagram”, “PNG transparente”, “para imprimir a 20×30”, “más ligera para la web”, “CMYK para la imprenta”, “el PNG de DTF”, “guarda el proyecto”.

## Diagnóstico

`checkpoint`. `get_metadata` de la imagen de trabajo: tamaño, resolución, alfa. No exportes encima del original.

## Pasos

1. El máster se queda en la sesión. `export_image` y `export_dtf_png` escriben una copia; no aplanes la imagen de trabajo para exportar.
2. Elige:
   - DTF: `export_dtf_png` después de `print_geometry`. El `dpi` solo etiqueta.
   - PNG, TIFF, WebP o GIF con alfa: `export_image`. Mira `alpha`, `flattened` y `warning`.
   - JPEG de web o cliente: `export_image` aplana y no acepta calidad ni submuestreo. Para fijarlos, el fragmento `jpeg` de `rules/gimp-exec-snippets.md` (partida 0,9; web 0,80–0,88; entrega 0,90–0,95). Si `gimp_exec` no está, entrega con `export_image` y di que la calidad es la del complemento, no la que pediste.
   - Impresión: pregunta sRGB o CMYK si no vino en el brief. `convert_profile` solo con una ruta `.icc` que te den. `soft_proof` no está implementado: no lo llames. TIFF o JPEG según pidan.
3. Instagram u otra pantalla, si aún no se escaló: fragmento `scale` (NoHalo) al ancho pedido y la nitidez corta de `nitidez` (`std_dev` 0,25, `scale` 2) antes de este export.
4. Reabre con `open_image` el archivo escrito. `get_metadata` sobre el id nuevo. `get_profile` si el brief hablaba de perfil. `get_bitmap`. Esquinas con `color_at` si pedían transparencia (alfa 0) o un JPEG opaco (alfa ausente).
5. Resume ruta, formato, si se conservó el alfa, DPI o píxeles, y el id del `checkpoint`.

## Verificaciones

Si `warning` viene informado o `alpha` es false y el brief pedía transparencia, no entregues ese archivo. Pulgadas DTF = píxeles / dpi del archivo reabierto, no las de la sesión antes de exportar.

## Errores comunes

Creer que `export_image` a JPEG respeta una calidad que no tiene argumento. Convertir a CMYK sin perfil del proveedor. Sobrescribir el JPEG de origen. Confundir `print_geometry` (remuestrea) con el `dpi` de `export_dtf_png` (etiqueta).

## Oficio

- `rules/exportacion.md`
- `rules/gimp-exec-snippets.md`
- `rules/dtf.md`
- `rules/seguridad.md`
