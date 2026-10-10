---
name: composicion
description: Recorte, horizonte, perspectiva y montaje. El MCP no recorta ni rota el lienzo; esos pasos usan los fragmentos documentados de gimp_exec.
---

# composicion

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

“Recórtala para Instagram”, “el horizonte está torcido”, “endereza el edificio”, “este documento”, “quita a esa persona del fondo”, “centra el producto”, “el logo abajo a la derecha”, “fondo blanco”, “gírala”.

## Diagnóstico

`get_metadata` (píxeles y DPI) y `get_bitmap`. Para un horizonte, `color_at` en el borde cielo/tierra a izquierda y a derecha: si la y no coincide, está torcido. `checkpoint`.

## Pasos

No hay herramienta de recorte, rotación ni escala del lienzo. Esos cuatro gestos son fragmentos de `rules/gimp-exec-snippets.md` (`crop`, `straighten`, `scale`, `canvas`). Dilo antes de llamar a `gimp_exec`. Si la herramienta no está, `GIMP_MCP_NO_EXEC` la apagó: para y explícalo.

1. Instagram u otra red. Pregunta la proporción si no viene en el brief. Partida de feed: 4:5. Stories: 9:16. El fragmento `crop` con esa proporción, sujeto cerca de un tercio (ancho/3 o 2·ancho/3). Luego `scale` al ancho de salida (1080 px en Instagram) con NoHalo. La nitidez de después es la skill `nitidez`, no este paso.
2. Horizonte. Mide dos puntos con `color_at`, pasa el ángulo al fragmento `straighten` y recorta las esquinas transparentes con `crop`. Una sola rotación. Verifica las cuatro esquinas con `color_at` (alfa 255 si el brief no pide transparencia).
3. Perspectiva de una fachada o un papel: fragmento `perspective` con las cuatro esquinas. Luego recorta el vacío. Si el edificio queda achatado, dilo; no reescales en bucle.
4. Producto con margen: `select_from_alpha` o `trim_to_content` si el margen vacío es transparente. Un margen de lienzo opaco es el fragmento `canvas`.
5. Logo: `layer_from_file`, fragmento `scale` si pesa de más, `move_layer` dejando un margen de cerca del 4 % del ancho, `set_opacity` 70 si es una marca de agua. Sombra: `drop_shadow` con `opacity` 0,3 y `blur` 8, y mira que la capa no se salga del lienzo.
6. Quitar un objeto grande: no hay Heal. `list_procedures` con filtro `heal`. Si no está Resynthesizer, dilo y no inventes un clonado mágico. Un defecto pequeño puede seguir el camino de `piel` (selección y blur). 
7. Volteo o giro de 90°: fragmento `rotate90` o `flip`. Avisa de que el texto y los rasgos quedan al revés.

`get_bitmap` después de cada transformación. `get_metadata` para ver que el ancho final alcanza al destino (redes ≥ 1080 de ancho; impresión ≈ pulgadas × 300).

## Verificaciones

Esquinas sin alfa accidental. Una sola interpolación, no tres rotaciones seguidas.

## Errores comunes

Recortar y dejar el archivo por debajo del tamaño de destino. Creer que `trim_to_content` recorta un JPEG opaco: solo mira el alfa. Llamar a `gimp_exec` con código libre en vez del fragmento.

## Oficio

- `rules/composicion.md`
- `rules/gimp-exec-snippets.md`
- `rules/exportacion.md`
- `rules/seguridad.md`
