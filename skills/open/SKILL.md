---
name: open
description: Abre o crea el documento, elige la imagen activa y lee tamaño, DPI y alfa antes de editar.
---

# open

Requiere el servidor MCP `gimp` (`gimp-mcp serve`).

## Cuándo usar

“Abre esta foto”, “crea un lienzo”, “parte de este PNG”, “qué tamaño tiene”. No retoca ni exporta.

## Diagnóstico

`status` y `list_images`. Si `status` falla, el puente no está: para.

## Pasos

1. Archivo existente: `open_image` con la ruta. Lienzo nuevo: `new_image` (`width`, `height`, `fill` `white` o `transparent`, `name`). Para DTF, `fill` `transparent` y luego `print_geometry` en la etapa `dtf`, no aquí.
2. Si hay varias imágenes, `set_active_image` con el id o el nombre base.
3. `get_metadata`: ancho, alto, resolución, alfa por capa, dirty.
4. `get_bitmap` para ver el encuadre. No llames a `flatten`.

## Verificaciones

El id devuelto por `open_image` o `new_image` es el que usarás. `get_metadata` no lee un archivo en disco sin abrirlo.

## Errores comunes

Editar la imagen equivocada cuando hay varias abiertas. Crear el lienzo en blanco cuando el brief pide transparencia.

## Oficio

- `rules/capas.md`
- `rules/seguridad.md`
