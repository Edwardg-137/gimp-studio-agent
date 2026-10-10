---
name: studio
description: Orquesta un brief de imagen en GIMP de punta a punta con el MCP gimp. Entrada única; no salta la revisión ni la exportación.
---

# studio

Requiere el servidor MCP `gimp` activo (`gimp-mcp` con argumentos `serve`), paquete `twelvetake-gimp-studio-mcp`.

## Cuándo usar

Cualquier encargo en lenguaje natural que deba acabar en un archivo: abrir, retocar, DTF o entregar. Es la entrada única. `open`, `edit`, `dtf`, `review` y `export` son etapas.

## Pasos

1. Escribe un plan corto: archivo de entrada, cambios, skill de etapa (`edit` o `dtf`) y ruta de salida.
2. Llama a `status`. Si falla, para y pide `gimp-mcp doctor`. No improvises Python.
3. Sigue la skill `open`.
4. `checkpoint` con una etiqueta del brief. El retroceso es `restore`, no `undo`.
5. Si el brief es DTF o impresión, sigue `dtf`. Si es edición general, sigue `edit`. Si mezcla ambos, `edit` y después `dtf`.
6. Sigue `review`. Si falla, corrige y vuelve a `review`. No exportes un review fallido.
7. Sigue `export`.
8. Resume herramientas, ruta exportada e id de `checkpoint`.

No saltes el paso 6 ni el 7.

## Verificaciones

Antes de `delete_layer`, `flatten`, `merge_down`, `knockout_background`, `cutout_color`, `clean_for_dtf` o exportar: `checkpoint`. `undo` y `redo` en GIMP 3 devuelven `supported: false` y no revierten.

`gimp_exec` solo si ninguna herramienta estructurada cubre el caso. Ver `rules/seguridad.md`.

## Oficio

- `rules/seguridad.md`
- `rules/capas.md`
- `rules/color.md`
- `rules/dtf.md`
- `rules/exportacion.md`

Si esta skill está instalada en el workspace, las mismas reglas están en `references/` junto a `studio`. El cliente MCP ya describe los parámetros; aquí va el orden y el criterio.
