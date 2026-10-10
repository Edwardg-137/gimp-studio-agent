---
name: export
description: Exporta desde GIMP conservando el alfa cuando el formato lo permite, y el PNG DTF con DPI. Cierra el flujo studio.
---

# export

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

Cuando `review` ya pasó. Es el cierre del flujo `studio`. No abras ni retouques aquí salvo el `checkpoint` previo y la comprobación del archivo escrito.

## Pasos

1. `checkpoint`. `get_metadata` de la imagen activa.
2. Elige la herramienta:
   - Entrega DTF o PNG con transparencia de film: `print_geometry` si el DPI aún no está, y después `export_dtf_png` (`path`, `dpi` opcional). No aplana: une visibles y conserva el alfa. El `dpi` solo etiqueta; no remuestrea.
   - Otro formato: `export_image` (`path`). El alfa se conserva en png, tiff, webp, tga y gif, y se aplana solo en jpg o bmp. `flatten` = true solo si el brief pide opaco. Mira el campo `warning` de la respuesta.
3. Vuelve a abrir lo exportado con `open_image` y llama a `get_metadata` sobre el id devuelto (DPI, tamaño, alfa).
4. `get_bitmap` de esa copia. Si no coincide con el review, no entregues: `restore` y corrige.
5. Cierra el resumen con la ruta, el formato, si se conservó el alfa y el id del checkpoint.

No uses `flatten` sobre la imagen de trabajo para exportar: `export_image` y `export_dtf_png` trabajan sobre una copia.

## Verificaciones

Si la respuesta trae `alpha: false` o un `warning` y el brief pedía transparencia, para y no renombres ese archivo como entrega.

`gang_sheet` ya escribió su PNG en la etapa `dtf`; aquí solo se verifica reabriéndolo, salvo que el brief pida otra copia.

## Oficio

- `rules/exportacion.md`
- `rules/dtf.md`
- `rules/seguridad.md`
