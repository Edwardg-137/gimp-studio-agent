# Selecciones y máscaras

La máscara guarda el original. No borres la capa para “quitar el fondo”. Elige la herramienta por el borde, no por costumbre. Lee ancho y alto, un `color_at` del fondo y del borde, y el histograma de `alpha` si ya hay transparencia.

## Qué usar

- Geométrico: `select_rect` o `select_ellipse`. `op`: `replace`, `add`, `subtract`, `intersect`.
- Color plano contiguo: `fuzzy_select`, umbral de partida 0,15. Si se come el sujeto, baja a 0,08 y suma con `add`. El mismo color en toda la imagen (cielo entre ramas): `select_by_color` con el mismo umbral.
- Pelo o borde roto: `foreground_select` con una pista `x,y,w,h` que rodee al sujeto e incluya un poco de fondo. No adivina sola. Si falla, no hay restore de selección: `select_none` y una caja más holgada. El pelo fino puede quedar a medias; dilo.
- Borde. Producto nítido: `select_shrink` 1 y `select_feather` 1. Persona: feather 2–5. Un ajuste local (aclarar solo la cara): feather 10–40 según el tamaño. Un feather de 30 px en un producto deja un halo. Halo de color: `select_shrink` 1–2 antes de la máscara, o `despill` si el fondo era de color.
- `add_mask` con `mask_type` `selection`, `white`, `black` o `alpha`. `apply_mask` es destructivo: hasta el export. `remove_mask` tira la máscara sin aplicarla.
- Fondo blanco o negro suave: `color_to_alpha`. Si ese color también está dentro del motivo, vacía los blancos interiores: usa `cutout_color` con `contiguous` true, o la selección contigua. Umbral de partida 0,15.
- Ajuste local: feather, `duplicate_layer`, el ajuste de color en la copia, máscara desde la selección.
- Guardar: `selection_to_channel`. Recuperar desde el alfa: `select_from_alpha`. Desde un path ya existente: `select_from_path`.

## Ver el borde

Antes de enmascarar, `get_bitmap`. Después, una capa temporal negra y otra de un color vivo debajo, y otra vez el bitmap del borde. Esquinas del recorte: `color_at` con alfa 0. El histograma de `alpha` en el borde debe pasar de 0 a 255 en pocos píxeles, salvo que el brief pida un fundido. Quita las capas de prueba antes de exportar.

## Fuentes

- Manual GIMP 3.0: fuzzy, por color, primer plano, menú de selección, pluma, encoger, máscara de capa, canales, color a alfa. https://docs.gimp.org/3.0/en/gimp-tool-fuzzy-select.html y páginas hermanas. Consultado 2026-10-10.
- Pat David, máscaras de capa y de luminosidad: https://www.gimp.org/tutorials/Layer_Masks/ y https://www.gimp.org/tutorials/Luminosity_Masks/ . Consultado 2026-10-10.
- API `Image.select_*`, `Layer.create_mask`: https://developer.gimp.org/api/3.0/libgimp/ . Consultado 2026-10-10.
- gimp-studio-mcp `tools/selections.py` y `tools/masks_alpha.py` (commit 429da76).
