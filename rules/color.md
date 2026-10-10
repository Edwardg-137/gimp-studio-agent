# Color y tono

Las herramientas de este archivo pisan píxeles. Duplica la capa o haz `checkpoint` antes de cada una. `undo` no deshace.

## Escalas

- `color_at` devuelve `rgba` en 0–255 sRGB. `histogram` con `space=perceptual` usa esa escala (media, mediana, mínimo, máximo).
- `levels` y `curves` piden 0,0–1,0 en luz lineal. El docstring del MCP pone el ejemplo: un pixel leído como 200 está cerca de 0,58 en `levels`. No conviertas el histograma a lineal por tu cuenta: el propio servidor no documenta esa conversión de forma única.
- `threshold` usa 0,0–1,0 en la escala de `color_at` (divide entre 255).
- `brightness_contrast`: cada eje de −1 a 1. En la práctica quédate entre −0,1 y 0,15.
- `hue_saturation`: tono −180..180, luminosidad y saturación −100..100.
- `color_balance`: ejes enteros. Partida en `midtones`, `preserve_lum` true, un eje entre 5 y 15.

## Cómo mover cada mando

Lee el histograma de `value` y de `red`/`green`/`blue` antes de tocar nada. Un máximo ya en 255 en una zona grande es detalle de luz que no vuelve.

1. Dominante. Un punto que debería ser neutro, con `color_at`. Si R, G y B se separan más de unas 5 cuentas, hay dominante. Cálida de más: baja `cyan_red` o empuja hacia el azul. Fría de más: sube `cyan_red` un poco. Temperatura, si hace falta: `apply_filter` `gegl:color-temperature`, partida 6500 K; tungsteno de partida 3200–4000 hacia 6500; sombra azulada 7500–9000 hacia 6500. Pasos de 500 K. Vuelve a medir el neutro.
2. Rango. `levels` en `value`. No subas gamma hasta ver el histograma. Oscura: gamma 1,1–1,3 y acerca `high_in` al final de los datos, no a un montón de píxeles. Comprueba que el histograma no pegue más zona a 0 y a 255 que antes.
3. Sombras sin quemar el cielo. `apply_filter` `gegl:shadows-highlights`: `shadows` 0,3 (la interfaz habla de +30), `highlights` 0 o −0,2, `compress` 50, `radius` 100. Halo en el borde cielo/monte: sube el radio o baja el efecto.
4. Contraste. Curva en S sobre `value`, puntos en lineal. Partida: `[0, 0, 0.25, 0.22, 0.75, 0.78, 1, 1]`. Si recorta, aplana la S.
5. Color selectivo. Cielo: `hue_saturation` con `range` `blue` o `cyan`, saturación 10–20, luminosidad −5 a −10. En un retrato no subas `red` ni `yellow`. Saturación global: `gegl:saturation` con `scale` 1,05–1,15 (1,0 no cambia). Vibrance: el nombre de la operación no está fijado aquí; `list_gegl_ops` con filtro `vibr` y, si no aparece, no inventes el op.
6. Blanco y negro: `desaturate` con `mode` `luminance`. Si la piel queda plana, no es el acabado.
7. Automático de partida: `normalize` con `keep_colors` true. Con false estira cada canal y puede teñir. Después relee el neutro.

Perfiles: `get_profile`, `assign_profile`, `convert_profile`. No conviertas de perfil a ciegas en un PNG de DTF. `soft_proof` siempre falla: es solo de vista.

## Fuentes

- Manual GIMP 3.0: curvas, niveles, exposición, sombras-luces, temperatura, balance, tono-saturación, saturación, balance de blancos. https://docs.gimp.org/3.0/en/ (páginas `gimp-tool-curves`, `gimp-tool-levels`, `gimp-filter-exposure`, `gimp-filter-shadows-highlights`, `gimp-filter-color-temperature`, `gimp-tool-color-balance`, `gimp-tool-hue-saturation`, `gimp-filter-saturation`, `gimp-layer-white-balance`). Consultado 2026-10-10.
- GEGL: https://gegl.org/operations/gegl-shadows-highlights.html y `gegl-color-temperature`, `gegl-saturation`. Consultado 2026-10-10.
- Cambridge in Colour, balance de blancos, histogramas y curvas: https://www.cambridgeincolour.com/tutorials/white-balance.htm , `histograms1.htm`, `photoshop-curves.htm`. Consultado 2026-10-10.
- API: https://developer.gimp.org/api/3.0/libgimp/method.Drawable.levels.html . Filtros desde un plug-in: https://developer.gimp.org/resource/writing-a-plug-in/tutorial-gegl-ops/ . Consultado 2026-10-10.
- gimp-studio-mcp `tools/color_tone.py` y `tools/filters.py` (commit 429da76). El ejemplo 200 sRGB ≈ 0,58 lineal sale del docstring de `levels`.
