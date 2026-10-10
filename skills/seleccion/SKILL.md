---
name: seleccion
description: Selecciones y máscaras. Recorte de fondo, pelo, ajustes locales y borde, sin borrar el original.
---

# seleccion

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

“Quita el fondo”, “recorta a la persona y cuida el pelo”, “aclara solo la cara”, “oscurece el cielo”, “cambia el color de la camiseta”, “el producto sobre blanco”, “guarda esta selección”, “el recorte tiene halo”.

## Diagnóstico

`get_metadata` (ancho y alto) y `get_bitmap`. `color_at` en el fondo y en un borde. `histogram` del canal `alpha` si ya hay transparencia. Elige la herramienta por el borde, no por costumbre.

## Pasos

La máscara guarda el original. No uses `delete_layer` para “quitar el fondo”.

1. Geométrico: `select_rect` o `select_ellipse` (`x`, `y`, `w`, `h`, `op` `replace`/`add`/`subtract`/`intersect`).
2. Color plano contiguo: `fuzzy_select` (`x`, `y`, `threshold` 0,15). Si se come el sujeto, baja a 0,08 y suma con `op` `add`. Color en toda la imagen (cielo entre ramas): `select_by_color` con el mismo umbral.
3. Pelo o borde roto: `foreground_select` con una pista `x,y,w,h` que rodee al sujeto e incluya un poco de fondo. No adivina sola. Si falla, `restore` de la selección no existe: `select_none` y prueba una caja más holgada. Avisa de que el pelo fino puede quedar a medias.
4. Borde. Producto nítido: `select_shrink` 1 y `select_feather` 1. Persona: feather 2–5. Un ajuste local (aclarar solo la cara): feather 10–40 según el tamaño. Halo de color: `select_shrink` 1–2 antes de la máscara, o `despill` si el fondo era de color.
5. `add_mask` con `mask_type` `selection` (o `white` / `black` / `alpha`). No llames a `apply_mask` hasta el export: es destructivo. `remove_mask` tira la máscara sin aplicarla.
6. Fondo blanco o negro suave: `color_to_alpha`. Si el mismo color está dentro del motivo, no: `cutout_color` con `contiguous` true, o la selección contigua del paso 2. Umbral de partida 0,15.
7. Ajuste local: `select_feather`, `duplicate_layer`, el ajuste de `color` en la copia, `add_mask` `selection`.
8. Guardar: `selection_to_channel`. Recuperar desde el alfa: `select_from_alpha`. Desde un path existente: `select_from_path`.

Verifica cada selección con `get_bitmap` antes de enmascarar. Luego una capa temporal de negro y otra de un color vivo debajo (`create_layer`, `fill`) y `get_bitmap` del borde. Esquinas del recorte: `color_at` con alfa 0. Quita las capas de prueba antes de exportar.

## Verificaciones

`histogram` de `alpha` en el borde: debe pasar de 0 a 255 en pocos píxeles, no en una franja ancha, salvo que el brief pida un fundido.

## Errores comunes

`color_to_alpha` que vacía los blancos interiores. Feather de 30 px en un producto. `apply_mask` a mitad del trabajo. Umbral de `fuzzy_select` alto.

## Oficio

- `rules/seleccion.md`
- `rules/capas.md`
- `rules/seguridad.md`
