---
name: nitidez
description: Ruido y nitidez. Primero el ruido, luego el enfoque, con umbral vía gegl:unsharp-mask. Siempre sobre una copia.
---

# nitidez

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

“Hazla más nítida”, “está desenfocada”, “quita el ruido”, “foto de noche con manchas”, “puntitos blancos”, “para Instagram”, “para imprimir”, “más claridad”, “enfoca solo los ojos”, “me pasé de nitidez”.

## Diagnóstico

`get_bitmap` con `region` en un borde contrastado y en una zona lisa (cielo o mejilla), a tamaño real. Si la zona lisa ya está granulada, el ruido va primero. `checkpoint` y `duplicate_layer`. El desenfoque de movimiento no se arregla con esta skill: dilo.

## Pasos

1. Ruido de color (manchas): duplica, `gaussian_blur` 3–5 en la copia, `set_blend_mode` `LCH_COLOR`. Partida 4. Si se lleva el color del sujeto, baja a 2. Verifica la zona lisa con `get_bitmap`.
2. Ruido de luminancia: `apply_filter` `gegl:noise-reduction` con `iterations` 2 (sube de uno en uno hasta 4). O `gegl:gaussian-blur-selective` con `blur_radius` 5 y `max_delta` 0,1 si solo quieres las zonas planas. Puntitos de sal y pimienta: `gegl:median-blur` `radius` 1, repetido dos veces si hace falta. No dejes la piel de plástico: si desaparecen los poros, baja o `restore`.
3. Nitidez. No uses `unsharp_mask` cuando haga falta umbral: no tiene ese argumento. `apply_filter` `gegl:unsharp-mask` con `std_dev`, `scale` y `threshold`. Partida de una foto normal: `std_dev` 0,8, `scale` 0,6, `threshold` 0,03. Detalle fino: `std_dev` 0,5, `scale` 0,8, `threshold` 0,02. Leve desenfoque: `std_dev` 1,2–1,5, `scale` 0,8. Salida web, después de escalar: `std_dev` 0,25, `scale` 2. Impresión: `std_dev` 1–2, `scale` 0,8. Claridad (contraste local): `std_dev` 40, `scale` 0,2. Sube `threshold` si el cielo se granula; baja `std_dev` si aparece un halo blanco en los bordes.
4. Solo ojos o producto: la copia enfocada, `add_mask` `black`, y pinta blanco con `paintbrush` en el iris, o `add_mask` `selection` tras `select_ellipse` con feather 2.
5. Paso alto, si piden “definición” suave: duplica, `apply_filter` `gegl:high-pass` `std_dev` 3 (1–3 detalle, 5–10 más marcado), `set_blend_mode` `SOFTLIGHT`, `set_opacity` 50. Verifica que el modo no haya caído a Normal.
6. Nitidez de salida solo después de escalar (skill `composicion` o el fragmento `scale` de `rules/gimp-exec-snippets.md`). Enfocar antes y reducir después tira el trabajo.

`get_bitmap` del borde y de la zona lisa después de cada paso. Halo: baja el radio antes que la cantidad. Si te pasaste y no hay checkpoint útil, una copia con `gaussian_blur` 0,3 en modo `DARKEN_ONLY` tapa el halo claro; es un parche, no el camino normal.

## Verificaciones

La zona lisa no debe ganar grano. El borde no debe tener un doble contorno.

## Errores comunes

`unsharp_mask` creyendo que el tercer número es el umbral. Enfocar un JPEG ya roto sin quitar ruido. Nitidez antes de reducir.

## Oficio

- `rules/nitidez.md`
- `rules/capas.md`
- `rules/seguridad.md`
