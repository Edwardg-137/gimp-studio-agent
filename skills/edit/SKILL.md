---
name: edit
description: Pintura, texto y capas sueltas. El color, la piel, la máscara, la nitidez y el recorte tienen su propia skill.
---

# edit

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

“Añade un texto”, “pinta esto”, “sube la opacidad”, “duplica la capa”, “una sombra bajo el logo”. Si el pedido es de tono, piel, recorte, ruido o DTF, cambia a esa skill. Esta no cierra el flujo: `studio` sigue con `review` y `export`.

## Diagnóstico

`get_metadata` y `get_bitmap`. `checkpoint` antes del primer cambio.

## Pasos

1. Capa nueva: `create_layer` (posición 0 = arriba) o `duplicate_layer` si vas a pintar encima de algo que quieres conservar.
2. Color de pintura: `set_fg` / `set_bg`. Brocha: `set_brush`. Opacidad del trazo: `set_paint_opacity` (piel y volumen van al 5–15, no al 100).
3. Relleno: `fill` (`foreground`, `background` o `transparent`) o `bucket_fill`. Trazos: `pencil` o `paintbrush`. Contorno de una selección: `stroke_selection`. Degradado: `gradient`.
4. Texto: `check_fonts` y luego `create_text_layer`. Ajustes con `set_text_props`. Contorno con `outline_text` (crea otra capa).
5. Orden y visibilidad: `reorder_layer`, `set_opacity` (0–100), `set_visible`, `rename_layer`. Modo de capa: `set_blend_mode` con un nombre de `rules/capas.md` (`SOFTLIGHT`, no `SOFT_LIGHT`). Si el resultado no cambia, el nombre era inválido y quedó en `NORMAL`.
6. Sombra de un logo: `drop_shadow`. Agranda la capa; compruébalo con `get_metadata`.
7. `delete_layer`, `merge_down` y `flatten` solo tras otro `checkpoint`.

Tras cada paso, `get_bitmap`.

## Verificaciones

No uses esta skill para `levels`, `curves`, `gaussian_blur` ni `unsharp_mask`: son de `color` y `nitidez`, y son destructivos.

## Errores comunes

Aplanar para “ver el resultado”. Un modo de capa que vuelve a Normal en silencio. Pintar al 100 % un dodge que debía ser un velo.

## Oficio

- `rules/capas.md`
- `rules/seguridad.md`
