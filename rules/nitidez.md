# Nitidez y ruido

El ruido va primero. Enfocar un JPEG ya granulado lo empeora. El desenfoque de movimiento no se arregla aquí: dilo y para.

`checkpoint` y `duplicate_layer`. Mira con `get_bitmap` un borde contrastado y una zona lisa (cielo o mejilla) a tamaño real. Si la zona lisa ya está granulada, no enfoques todavía.

## Ruido

- Manchas de color: duplica, `gaussian_blur` 3–5 (partida 4), `set_blend_mode` `LCH_COLOR`. Si se lleva el color del sujeto, baja a 2.
- Luminancia: `apply_filter` `gegl:noise-reduction`, `iterations` 2, y sube de uno en uno hasta 4. Solo zonas planas: `gegl:gaussian-blur-selective` con `blur_radius` 5 y `max_delta` 0,1. Sal y pimienta: `gegl:median-blur` `radius` 1, dos veces si hace falta. Si desaparecen los poros, baja o `restore`.

## Nitidez

`unsharp_mask` solo fija `std-dev` y `scale`. No tiene umbral. Para el umbral, `apply_filter` con `gegl:unsharp-mask`: las claves con guion bajo pasan a guion (`std_dev` → `std-dev`).

Partidas, en ese orden de radio, cantidad y umbral:

| Caso | std_dev | scale | threshold |
| --- | --- | --- | --- |
| Foto normal | 0,8 | 0,6 | 0,03 |
| Detalle fino | 0,5 | 0,8 | 0,02 |
| Leve desenfoque | 1,2–1,5 | 0,8 | 0,03 |
| Web, después de escalar | 0,25 | 2 | 0,02 |
| Impresión | 1–2 | 0,8 | 0,03 |
| Claridad (contraste local) | 40 | 0,2 | 0 |

Sube `threshold` si el cielo se granula. Baja `std_dev` si aparece un halo blanco. La zona lisa no debe ganar grano. El borde no debe tener doble contorno.

Solo ojos o producto: copia enfocada, `add_mask` `black` y pinta blanco en el iris, o máscara `selection` tras una elipse con feather 2.

Paso alto, si piden definición suave: duplica, `gegl:high-pass` con `std_dev` 3 (1–3 detalle, 5–10 más marcado), `SOFTLIGHT`, `set_opacity` 50. Comprueba que el modo no haya caído a Normal.

La nitidez de salida va después de escalar. Enfocar y luego reducir tira el trabajo.

Si te pasaste y no hay un checkpoint útil, una copia con `gaussian_blur` 0,3 en `DARKEN_ONLY` tapa un halo claro. Es un parche.

## Fuentes

- Cambridge in Colour, nitidez, unsharp, ruido y redimensionado: https://www.cambridgeincolour.com/tutorials/image-sharpening.htm , `unsharp-mask.htm`, `image-noise-2.htm`, `image-resize-for-web.htm`. Consultado 2026-10-10.
- Manual GIMP 3.0: unsharp, high pass, noise reduction, despeckle, median, gaussiano selectivo, escalar. https://docs.gimp.org/3.0/en/gimp-filter-unsharp-mask.html y páginas hermanas. Consultado 2026-10-10.
- Eric R. Jeschke, nitidez selectiva y ruido CCD: https://www.gimp.org/tutorials/Smart_Sharpening/ y https://www.gimp.org/tutorials/Reducing_CCD_Noise/ . Consultado 2026-10-10.
- GEGL `gegl:unsharp-mask` (`std-dev`, `scale`, `threshold`): https://gegl.org/operations/gegl-unsharp-mask.html . Consultado 2026-10-10.
- gimp-studio-mcp `tools/filters.py`: `unsharp_mask` no asigna `threshold`; `apply_filter` convierte `_` en `-` y luego `merge_filter`. Revisado el 2026-10-10.
