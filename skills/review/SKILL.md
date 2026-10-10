---
name: review
description: Revisa el resultado en GIMP con get_bitmap, histograma y metadatos antes de exportar. No exporta.
---

# review

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

Después de `edit` o `dtf` y antes de `export`. Obligatorio en el flujo `studio`. No da por bueno un archivo sin mirarlo.

## Pasos

1. `get_bitmap` de la imagen activa (la vista que el agente puede ver). Si el aviso de tamaño lo pide, usa `save_to` y lee esa ruta.
2. `histogram` en `value` y, si hay transparencia, en `alpha` (`space` = `perceptual`).
3. `color_at` en dos o tres puntos que el brief señale (borde, fondo, zona de tinta).
4. `get_metadata`: DPI, tamaño y `has_alpha` de las capas que deben conservar transparencia.
5. Checklist, en este orden:
   - El sujeto sigue ahí; el knockout no se comió lineart ni contras de letras.
   - El alfa no tiene polvo (manchas bajas) ni un halo del color de fondo.
   - La base blanca, si existe, no asoma por fuera del arte.
   - El DPI y las pulgadas cuadran con el brief (`print_geometry` ya aplicado si es DTF).
6. Si algo falla, dilo y vuelve a la skill de etapa. No llames a `export_image` ni a `export_dtf_png` desde aquí.

## Verificaciones

Esta skill es de lectura salvo que el checklist pida un `checkpoint` nuevo antes de corregir. No uses `flatten` para “ver mejor”.

## Oficio

- `rules/color.md`
- `rules/dtf.md`
- `rules/exportacion.md`
