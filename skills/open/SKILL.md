---
name: open
description: Abre o crea el documento de GIMP, fija la imagen activa y comprueba metadatos antes de editar.
---

# open

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

Al empezar un brief: abrir un archivo, crear un lienzo o elegir entre imágenes ya abiertas. No exporta y no retoca.

## Pasos

1. `status` y `list_images`.
2. Si el brief trae un archivo, `open_image` con su ruta. Si pide un lienzo nuevo, `new_image` (`width`, `height`, `fill` = `white` | `transparent` | `background` | `foreground`, `name`).
3. `set_active_image` si hay más de una imagen. El argumento es el id o el nombre base.
4. `get_metadata` de la imagen activa: tamaño, resolución, alfa por capa, ruta y flag dirty.
5. Si el brief pide una capa base extra, `create_layer` (posición 0 = arriba). No aplanes.

## Verificaciones

`open_image` y `new_image` no son destructivos sobre otros documentos. No llames a `flatten` ni a `export_image` en esta etapa.

Si `status` falla, no sigas: el puente no está. Pide `gimp-mcp doctor` y reiniciar GIMP.

## Oficio

- `rules/capas.md`
- `rules/seguridad.md`
