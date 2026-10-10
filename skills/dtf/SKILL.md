---
name: dtf
description: Producción DTF con el MCP gimp. Knockout de prenda, underbase, choke, gang sheet y PNG a DPI. No exporta sin la skill export.
---

# dtf

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

Knockout de color de prenda, base blanca, choke o spread, limpieza para film, hoja gang o geometría de impresión. La exportación del PNG la hace la skill `export` con `export_dtf_png`.

## Pasos

1. `checkpoint`. `get_metadata` y `get_bitmap`.
2. `list_shirt_presets` si el brief nombra una prenda.
3. Quita el fondo con `knockout_background` (`shirt` = preset, o `color`, o `sample_xy`). `mode` = `auto` salvo que el brief pida `hard` o `subtract`. `contiguous` = true solo si el color de la prenda también es lineart interior.
   - Un solo color plano, sin lógica de prenda: `cutout_color` (duro) o `color_to_alpha` (suave), no `knockout_background`.
4. Halo de color: `despill` (`color`, `amount`). Es una aproximación; míralo con `get_bitmap`.
5. `edge_choke` (píxeles hacia dentro) antes de la base blanca. `edge_spread` solo si hay que engordar el borde.
6. `white_underbase` (`choke`, `opacity`) debajo del arte.
7. `clean_for_dtf` solo si el film necesita alfa binaria. Endurece bordes suaves; no lo uses si el arte debe conservar antialias. Ver `rules/dtf.md`.
8. `trim_to_content` (`padding`) para quitar margen transparente.
9. `print_geometry` (`dpi` y, si hace falta, `width_in` o `height_in`) antes de exportar. No remuestrea el DPI por sí solo en el archivo: deja el tamaño físico aquí.
10. Sangrado: `bleed_and_safe` (`bleed_in`, `safe_in`).
11. Hoja con varios archivos: `gang_sheet` (`files`, `out_path`, `sheet_width_in` por defecto 22, `dpi` por defecto 300, `gutter_in`). Esa herramienta ya escribe un PNG; aun así pasa por `review` sobre el resultado.
12. `halftone_separation` es solo una previsualización, no una separación de film a registro.

No llames a `export_dtf_png` aquí si quien orquesta es `studio`: la etapa siguiente es `review` y luego `export`.

## Verificaciones

`checkpoint` antes de `knockout_background`, `cutout_color`, `clean_for_dtf`, `edge_choke` y `white_underbase`. Después, `get_bitmap` y `histogram` del canal `alpha`.

## Oficio

- `rules/dtf.md`
- `rules/exportacion.md`
- `rules/seguridad.md`
