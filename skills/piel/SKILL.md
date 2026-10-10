---
name: piel
description: Retoque de piel y retrato. Conserva poros. Limpieza, frecuencias, volumen, ojos y dientes con herramientas reales del MCP.
---

# piel

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

“Quita los granos”, “suaviza la piel pero que se vea natural”, “ojeras”, “empareja el tono”, “escúlpele la cara”, “ojos más brillantes”, “blanquea los dientes”, “ojos rojos”, “brillo de la frente”, “este lunar”. Si el lunar puede ser un rasgo, pregunta antes de quitarlo.

## Diagnóstico

`get_bitmap` de la cara y un `region` de mejilla a tamaño real. Tienen que verse poros antes de empezar. `checkpoint`. Duplica la base con `duplicate_layer`, renómbrala y oculta el original (`set_visible` false).

## Pasos

El orden es color global (`color`) si hace falta, luego esto, luego nitidez de ojos (`nitidez`), luego `review`.

1. Frecuencias cuando piden suavizar. Duplica otra vez: “Baja” y “Alta”. En Baja, `gaussian_blur`. Partida según el encuadre: 2–4 px en imagen pequeña, 4–6 en piel joven y archivo grande, 6–8 en retrato medio, 8–12 si la textura es gruesa. Sube el radio solo hasta que los poros desaparezcan y la forma de la cara siga. En Alta, `set_blend_mode` `GRAIN_EXTRACT`. `get_bitmap`: debe verse gris con relieve. No hay “nueva desde visible”: si hace falta fundir, usa el fragmento `new_from_visible` de `rules/gimp-exec-snippets.md`. Comprueba con `color_at` en tres puntos que Baja + textura reconstruyen el original (diferencia de 1 o 2 cuentas). El tono se iguala en Baja, no difuminando la textura.
2. Granos sueltos. No hay Heal ni Clone. Selección pequeña (`select_ellipse`), `select_feather` 2–4, `gaussian_blur` suave solo dentro de esa zona en la capa Baja, `select_none`. Si el defecto tiene borde de pelo, dilo: hace falta el fragmento `heal` y, si no basta, el usuario en el lienzo en vivo.
3. Volumen. `create_layer`, `set_fg` `#808080`, `fill` `foreground`, `set_blend_mode` `SOFTLIGHT`. `set_paint_opacity` 8. `paintbrush` blanco en pómulo, puente y frente; negro bajo el pómulo. Si la cara no cambia, el modo no se aplicó (un `SOFT_LIGHT` cae a Normal). Verifica `get_bitmap` a pantalla completa: el volumen se intuye, no se dibuja.
4. Ojos rojos. `select_ellipse` de la pupila, `select_feather` 1–2, `apply_filter` `gegl:red-eye-removal` con `threshold` 0,4. Si se comen otros rojos, la selección no cubría solo la pupila: `restore` esa parte.
5. Dientes. Selección con `select_feather` 1–3. `hue_saturation` `range` `yellow`, `saturation` −40 (entre −30 y −60), `lightness` 10 (entre 5 y 15). `color_at`: marfil, no 255,255,255. R un poco por encima de B.
6. Iris. Misma selección suave. `hue_saturation` `saturation` 10–20. La nitidez del iris es la skill `nitidez`, no un blur al revés.
7. Brillo graso. Capa nueva, `set_blend_mode` `DARKEN_ONLY`, `set_paint_opacity` 25, `paintbrush` con un tono muestreado por `color_at` al lado del brillo.

`get_bitmap` con `region` en la mejilla después de cada paso. Los poros siguen ahí.

## Verificaciones

Si Baja + textura no reconstruye, no edites todavía. Ojos y dientes: nada de blanco puro.

## Errores comunes

Difuminar la cara entera. Radio de Baja tan alto que la textura no tiene de dónde volver. Origen de “clon” siempre igual, que estampa un patrón. `SOFT_LIGHT`.

## Oficio

- `rules/piel.md`
- `rules/capas.md`
- `rules/gimp-exec-snippets.md`
- `rules/seguridad.md`
