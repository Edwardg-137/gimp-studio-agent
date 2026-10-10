---
name: color
description: Color y tono en GIMP. Exposición, niveles, curvas, dominante, saturación y blanco y negro, con valores de partida.
---

# color

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

“Aclara las sombras sin quemar el cielo”, “quita el amarillo”, “está muy azul”, “dale contraste”, “está oscura”, “se ve quemada”, “colores más vivos pero sin piel naranja”, “cielo más azul”, “look cine”, “pásala a blanco y negro”, “corrígela en automático”.

## Diagnóstico

`histogram` en `value`, `red`, `green` y `blue` (`space` `perceptual`, escala 0–255). `color_at` en un punto que debería ser neutro (pared, papel, camiseta gris). `get_bitmap`. Si el máximo de un canal ya es 255 en una zona grande, el detalle de esa luz no vuelve.

## Pasos

Antes de cada ajuste: `duplicate_layer` (oculta el original con `set_visible`) o `checkpoint`. Todas estas herramientas pisan píxeles. `undo` no deshace.

1. Dominante. Partida: `color_balance` en `midtones`, `preserve_lum` true, un eje entre 5 y 15 (`cyan_red`, `magenta_green`, `yellow_blue`). Cálida de más: baja `cyan_red` o sube hacia el azul. Fría de más: sube `cyan_red` un poco. Si hace falta temperatura de color, `apply_filter` con `gegl:color-temperature` y `original_temperature` / `intended_temperature` (partida 6500; tungsteno de partida 3200–4000 hacia 6500; sombra azulada 7500–9000 hacia 6500). Ajusta de 500 en 500. Verifica con `color_at`: en el neutro, R, G y B a menos de 5 cuentas.
2. Rango. `levels` en `value`. Los argumentos son luz lineal 0–1, no el 0–255 de `color_at` (200 sRGB ≈ 0,58 lineal). Partida: no toques gamma hasta ver el histograma; si está oscura, gamma 1,1–1,3 y acerca `high_in` al final de los datos. No pongas `low_in`/`high_in` donde ya hay un montón de píxeles. Verifica que `histogram` no pegue min a 0 y max a 255 en más zona que antes.
3. Sombras sin quemar luces. `apply_filter` `gegl:shadows-highlights`: `shadows` 0,3 como partida (la UI habla de +30), `highlights` 0 o −0,2, `compress` 50, `radius` 100. Si salen halos en el borde cielo/monte, sube `radius` o baja el efecto. Verifica `get_bitmap` en ese borde y el histograma de `value`.
4. Contraste. `curves` en `value`, puntos en lineal 0–1. Partida de una S suave: `[0,0, 0.25,0.22, 0.75,0.78, 1,1]`. Si recorta, aplana la S. `brightness_contrast` solo para un empujón: cada eje entre −0,1 y 0,15, no ±1.
5. Color selectivo. `hue_saturation` con `range` `blue` o `cyan` para un cielo: `saturation` 10–20, `lightness` −5–−10. Piel: no subas `red` ni `yellow`. Saturación global: `apply_filter` `gegl:saturation` con `scale` 1,05–1,15 (1,0 no cambia). Vibrance: antes `list_gegl_ops` con filtro `vibr`; si no aparece, no inventes el nombre.
6. Blanco y negro: `desaturate` con `mode` `luminance`. Si la piel queda plana, no es esta herramienta: dilo y para.
7. Automático de partida: `normalize` con `keep_colors` true para no teñir. Luego el paso 1 si el neutro se movió.

Tras cada número, `get_bitmap` y `histogram`. Si empeora, `restore`.

## Verificaciones

Un neutro con R, G y B separados más de 5 es dominante nueva. Piel naranja: baja la saturación de `red`/`yellow` o restaura.

## Errores comunes

Pasar el 0–255 de `color_at` tal cual a `levels` o `curves`. Subir saturación global en un retrato. Tratar `normalize` como el acabado.

## Oficio

- `rules/color.md`
- `rules/capas.md`
- `rules/seguridad.md`
