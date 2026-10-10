# Capas y modos

## Orden y copias

- `create_layer` inserta en la posición 0 (arriba) salvo que pases otra. `layer_from_file` carga un archivo como capa.
- `duplicate_layer` antes de un filtro. `set_visible` en false oculta el original; un merge de visibles no lo exporta. Compruébalo en `review` con `get_bitmap`.
- `delete_layer`, `merge_down` y `flatten` van detrás de `checkpoint`. No aplanes si el siguiente paso necesita alfa (DTF, PNG transparente).
- `drop_shadow` agranda la capa y puede sacarla del lienzo (el propio docstring del MCP lo midió en GIMP 3.0.4). Mira el tamaño con `get_metadata`.
- `group_create`, `group_add` y `group_ungroup` ordenan. No desagrupes para “simplificar” antes de tiempo.

## set_blend_mode

El código hace `nombre.upper()`, cambia `-` y espacios por `_`, y busca `Gimp.LayerMode.<ESO>`. Si el atributo no existe, pone `NORMAL` y no avisa. El campo `mode` de la respuesta es el texto que pediste, en mayúsculas: no demuestra que el modo se aplicó. El entero aplicado es `mode_value`. Si la imagen no cambia, el nombre era inválido.

Soft light es `SOFTLIGHT`. `SOFT_LIGHT` y `soft-light` caen a Normal.

Nombres del enum `Gimp.LayerMode` (API 3.0, sufijo tras `GIMP_LAYER_MODE_`). Pasa el sufijo tal cual:

`NORMAL`, `BEHIND`, `MULTIPLY`, `SCREEN`, `OVERLAY`, `DIFFERENCE`, `ADDITION`, `SUBTRACT`, `DARKEN_ONLY`, `LIGHTEN_ONLY`, `HSV_HUE`, `HSV_SATURATION`, `HSL_COLOR`, `HSV_VALUE`, `DIVIDE`, `DODGE`, `BURN`, `HARDLIGHT`, `SOFTLIGHT`, `GRAIN_EXTRACT`, `GRAIN_MERGE`, `VIVID_LIGHT`, `PIN_LIGHT`, `LINEAR_LIGHT`, `HARD_MIX`, `EXCLUSION`, `LINEAR_BURN`, `LUMA_DARKEN_ONLY`, `LUMA_LIGHTEN_ONLY`, `LUMINANCE`, `COLOR_ERASE`, `ERASE`, `MERGE`, `SPLIT`, `PASS_THROUGH`, `REPLACE`, `OVERWRITE`, `DISSOLVE`.

Variantes `*_LEGACY` del mismo enum (el sufijo incluye `_LEGACY`): `NORMAL_LEGACY`, `BEHIND_LEGACY`, `MULTIPLY_LEGACY`, `SCREEN_LEGACY`, `OVERLAY_LEGACY`, `DIFFERENCE_LEGACY`, `ADDITION_LEGACY`, `SUBTRACT_LEGACY`, `DARKEN_ONLY_LEGACY`, `LIGHTEN_ONLY_LEGACY`, `HSV_HUE_LEGACY`, `HSV_SATURATION_LEGACY`, `HSL_COLOR_LEGACY`, `HSV_VALUE_LEGACY`, `DIVIDE_LEGACY`, `DODGE_LEGACY`, `BURN_LEGACY`, `HARDLIGHT_LEGACY`, `SOFTLIGHT_LEGACY`, `GRAIN_EXTRACT_LEGACY`, `GRAIN_MERGE_LEGACY`, `COLOR_ERASE_LEGACY`.

Los que usa el oficio: `GRAIN_EXTRACT` (textura de piel), `SOFTLIGHT` (volumen y paso alto), `LCH_COLOR` (ruido de color), `DARKEN_ONLY` (brillo graso o un halo claro).

## Fuentes

- gimp-studio-mcp `tools/layers.py` (helper `_blend_mode` y `set_blend_mode`) y `tools/filters.py` (`drop_shadow`): https://github.com/TwelveTake-Studios/gimp-studio-mcp (commit 429da76). Revisado el 2026-10-10.
- Enum: https://developer.gimp.org/api/3.0/libgimp/enum.LayerMode.html (consultado 2026-10-10).
- Manual de modos: https://docs.gimp.org/3.0/en/gimp-concepts-layer-modes.html (consultado 2026-10-10).
