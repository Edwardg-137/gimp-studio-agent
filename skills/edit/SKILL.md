---
name: edit
description: Edición cotidiana en GIMP (selección, pintura, texto, color, filtros y capas) con herramientas estructuradas del MCP gimp.
---

# edit

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

Pintura, selección, texto, tono, color y filtros de un encargo que no es solo producción DTF. La orquesta es `studio`: esta skill no sustituye a `review` ni a `export`.

## Pasos

1. `checkpoint` antes del primer cambio.
2. Inspecciona con `get_metadata` y, si el cambio es de tono, `histogram` (`channel` = `value`, `space` = `perceptual`).
3. Elige herramientas estructuradas, en este orden de preferencia:
   - Selección: `select_rect`, `select_ellipse`, `select_by_color`, `fuzzy_select`, `foreground_select`, `select_from_alpha`, `select_feather`, `select_grow`, `select_shrink`, `select_none`.
   - Capas: `create_layer`, `duplicate_layer`, `set_opacity`, `set_blend_mode`, `set_visible`, `move_layer`, `rename_layer`. `delete_layer`, `merge_down` y `flatten` solo tras otro `checkpoint`.
   - Pintura: `set_fg`, `set_bg`, `set_brush`, `set_paint_opacity`, `fill`, `bucket_fill`, `pencil`, `paintbrush`, `stroke_selection`, `gradient`.
   - Texto: `check_fonts` y después `create_text_layer`. Ajustes con `set_text_props`. Contorno con `outline_text` (añade una capa).
   - Tono y color: `brightness_contrast`, `levels`, `curves`, `hue_saturation`, `color_balance`, `desaturate`, `normalize`, `posterize`, `threshold`, `invert`.
   - Filtros: `gaussian_blur`, `unsharp_mask`, `drop_shadow`. `apply_filter` solo para un op GEGL que no tenga herramienta propia; antes `describe_op` o `list_gegl_ops`.
   - Alfa suave o recorte de un color plano: `add_alpha`, `color_to_alpha` (suave) o `cutout_color` (duro). Un knockout de prenda es la skill `dtf` (`knockout_background`), no esta.
4. Tras el cambio, `get_bitmap` de la imagen activa. Si no cuadra, `restore` del checkpoint y reintenta.

## Verificaciones

`levels` y `curves` hablan en 0.0–1.0 lineal, no en el 0–255 sRGB de `color_at`. `threshold` sí usa la escala 0–1 de `color_at` / 255. Ver `rules/color.md`.

No uses `gimp_exec` para estas tareas. Ver `rules/seguridad.md` y `rules/capas.md`.

## Oficio

- `rules/color.md`
- `rules/capas.md`
- `rules/seguridad.md`
